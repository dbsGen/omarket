/**
 * Created by mac on 2018/5/14.
 */
"use strict";

var RETURN_MAX = 16;
var COMMENT_MAX = 16;

var CommentItem = function (owner) {
    if (this.owner) {
        this.owner = owner;
        this.visible = true;
        this.timestamp = Blockchain.block.timestamp;
        this.id = "" + this.timestamp + Math.random();
    }
};

CommentItem.from = function (text) {
    var item = new CommentItem();
    var json = JSON.parse(text);
    item.owner = json.owner;
    item.agreement = json.agreement;
    item.content = json.content;
    item.id = json.id;
    item.next_id = json.next_id;
    item.prev_id = json.prev_id;
    item.timestamp = json.timestamp;
    item.visible = json.visible;
    return item;
};

var AppItem = function () {
    this.releases = [];
    Object.defineProperties(this, {
        id: {
            get: function() {
                return AppItem.genId(this.owner, this.app_id);
            },
            set: function (value) {

            }
        }
    });
    this.main_next_id = null;
    this.main_prev_id = null;
    this.visible = true;
    this.last_timestamp = Blockchain.block.timestamp;
    this.last_comment_id = null;
};
AppItem.from = function (owner, app_id) {
    var item = new AppItem();
    if (app_id) {
        item.owner = owner;
        item.app_id = app_id;
    }else {
        var json = JSON.parse(owner);
        item.owner = json.owner;
        item.app_id = json.app_id;
        item.releases = json.releases || [];
        item.main_next_id = json.main_next_id;
        item.main_prev_id = json.main_prev_id;
        item.name = json.name;
        item.visible = json.visible;
        item.pic_address = json.pic_address;
        item.des = json.des;
    }
    return item;
};
AppItem.genId = function (owner, id) {
    return owner + '/' + id;
};

var OpenMarket = function () {
    LocalContractStorage.defineProperty(this, "dapp_last_id");
    LocalContractStorage.defineProperty(this, "android_last_id");
    LocalContractStorage.defineMapProperty(this, "items", {
        stringify: function (item) {
            return JSON.stringify(item);
        },
        parse: function (text) {
            return AppItem.from(text);
        }
    });
    LocalContractStorage.defineMapProperty(this, "comments", {
        stringify: function (item) {
            return JSON.stringify(item);
        },
        parse: function (text) {
            return CommentItem.from(text);
        }
    });
    LocalContractStorage.defineMapProperty(this, 'user2apps', {
        stringify: function (item) {
            return JSON.stringify(item);
        },
        parse: function (text) {
            return JSON.parse(text);
        }
    });
};
OpenMarket.prototype = {
    init: function() {

    },
    _save: function (item) {
        this.items.set(item.id, item);
    },
    fetch: function (last_id, type) {
        var rets = [];
        if (!last_id) {
            last_id = LocalContractStorage.get(type + '_last_id');
        }
        if (last_id) {
            while (rets.length < RETURN_MAX) {
                var item = this.items.get(last_id);
                if (item) {
                    if (item.visible) rets.push(item);
                    last_id = item.main_next_id;
                }else {
                    break;
                }
            }
        }
        return rets;
    },
    fetchOne: function(id) {
        return this.items.get(id);
    },
    accept:function(){
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.from,
                to: Blockchain.transaction.to,
                value: Blockchain.transaction.value
            }
        });
    },
    myApps: function () {
        var owner = Blockchain.transaction.from;
        return this.user2apps.get(owner);
    },
    post: function(type, name, app_id, version, address, pic_address, des, visible) {
        var owner = Blockchain.transaction.from;
        var id = AppItem.genId(owner, app_id);
        var item = this.items.get(id);
        if (!item) {
            item = AppItem.from(owner, app_id);
        }
        var timestamp = Blockchain.block.timestamp;
        if (version && address && version !== 'null' && address !== 'null') {
            item.releases.unshift({
                version: version,
                address: address,
                timestamp: timestamp
            });
        }
        item.pic_address = pic_address;
        if (name && name != 'null')
            item.name = name;
        item.last_timestamp = timestamp;
        if (des && des != null)
            item.des = des;
        item.visible = !!visible;
        var key = type + '_last_id';
        var last_id = LocalContractStorage.get(key);
        var apps = this.user2apps.get(owner);
        if (!apps) {
            apps = [];
        }
        if (apps.indexOf(app_id) < 0) {
            apps.push(app_id);
        }
        this.user2apps.set(owner, apps);
        if (last_id === id) {

        }else {
            var last_item = this.items.get(last_id);
            if (!last_item) {
                last_id = item.id;
                LocalContractStorage.set(key, last_id);
            }else {
                var dn = item.main_next_id;
                var dp = item.main_prev_id;
                item.main_next_id = dn;
                item.main_prev_id = null;
                last_item.main_prev_id = id;
                var p_item = dp ? this.items.get(dp) : null;
                var n_item = dn ? this.items.get(dn) : null;
                p_item.main_next_id = n_item ? n_item.id : null;
                n_item.main_prev_id = p_item ? p_item.id : null;

                LocalContractStorage.set(key, id);
                this._save(last_item);
                this._save(p_item);
                this._save(n_item);
            }
        }
        this._save(item);
    },
    update: function (app_id, ops) {
        var owner = Blockchain.transaction.from;
        var id = AppItem.genId(owner, app_id);
        var item = this.items.get(id);
        if (item) {
            for (var k in ops) {
                if (k !== 'visible') {
                    continue;
                }
                item[k] = ops[k];
            }
            this._save(item);
        }
    },
    fetchComments: function(item_id, last_id) {
        var item = this.items.get(item_id);
        var comments = [];
        if (item) {
            if (!last_id) {
                last_id = item.last_comment_id;
            }
            while (comments.length < COMMENT_MAX) {
                var comment = this.comments.get(last_id);
                if (comment) {
                    if (comment.agreement >= 0) comments.push(comment);
                    last_id = comment.next_id;
                }else {
                    break;
                }
            }
        }
        return comments;
    },
    postComment: function (item_id, owner, content) {
        var item = this.items.get(item_id);
        if (item) {
            var comment = new CommentItem(owner);
            comment.content = content;
            var last_id = item.last_comment_id;
            var last_comment = this.comments.get(last_id);
            if (last_comment) {
                comment.next_id = last_id;
                last_comment.prev_id = item.last_comment_id = comment.id;
            }else {
                item.last_comment_id = comment.id;
            }
            this.comments.set(comment.id, comment);
            this._save(item);
        }
    }
};

module.exports = OpenMarket;
