/**
 * Created by mac on 2018/5/15.
 */

var config = {
    host: "https://mainnet.nebulas.io",
    address: 'n1y44Zo4HrnbQTBcdWayguxKxZeuuXvp6wm'
};

var none = 0;

var NebAccount = nebulas.Account;

function LocAccount(ops) {
    this.options = $.extend({}, config, ops);
    this.neb = new nebulas.Neb();
    this.neb.setRequest(new nebulas.HttpRequest(this.options.host));
    this.queue = [];
    window.postMessage({
        "target": "contentscript",
        "data": {
        },
        "method": "getAccount"
    }, "*");
    var self = this;
    window.onmessage = function (e) {
        var data = e.data.data;
        if (!data) return;
        if (data.account) {
            self.account = data.account;
            if (self.onAccount) {
                self.onAccount(self.account);
            }
        }else if (data.neb_call){
            if (self.queue.length) {
                var cItem = self.queue.shift();
                if (cItem) {
                    data = data.neb_call;
                    if (data.execute_err && data.execute_err.length > 0 && cItem._catch) {
                        cItem._catch(data.execute_err);
                    }else if (cItem._then){
                        cItem._then(data);
                    }
                }
            }
        }else if (data.txhash){
            if (self.queue.length) {
                var cItem = self.queue.shift();
                if (cItem) {
                    data = data.txhash;
                    if (cItem._then) cItem._then(data);
                }
            }
        }else {

        }
    };
}

LocAccount.prototype.call = function () {
    if (arguments.length > 0) {
        var method = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }
        var ret = {
            then: function (func) {
                this._then = func;
                return  this;
            },
            catch: function (func) {
                this._catch = func;
                return  this;
            }
        };
        var self = this;
        (function (ret) {
            self.queue.push(ret);
            window.postMessage({
                "target": "contentscript",
                "data": {
                    "to": self.options.address,
                    "value": "0",
                    "contract": {
                        "function": method,
                        "args": JSON.stringify(args)
                    }
                },
                "method": "neb_call"
            }, "*");
        })(ret);
        return ret;
    }
};

LocAccount.prototype.transaction = function () {
    if (arguments.length > 0) {
        var method = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }
        var ret = {
            then: function (func) {
                this._then = func;
                return  this;
            },
            catch: function (func) {
                this._catch = func;
                return  this;
            }
        };
        var self = this;
        (function (ret) {
            self.queue.push(ret);
            window.postMessage({
                "target": "contentscript",
                "data": {
                    "to": self.options.address,
                    "value": "0",
                    "contract": {
                        "function": method,
                        "args": JSON.stringify(args)
                    }
                },
                "method": "neb_sendTransaction"
            }, "*");
        })(ret);
        return ret;
    }
};

LocAccount.prototype.locCall = function () {
    if (arguments.length > 0) {
        var method = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }
        var ret = {
            then: function (func) {
                this._then = func;
                return  this;
            },
            catch: function (func) {
                this._catch = func;
                return  this;
            }
        };
        var self = this;
        (function (ret) {
            var from = self.account;
            if (!from) {
                from = NebAccount.NewAccount().getAddressString();
            }
            self.neb.api.call({
                from: from,
                to: self.options.address,
                value: 0,
                nonce: none++,
                gasPrice: 1000000,
                gasLimit: 2000000,
                contract: {
                    function: method,
                    args: JSON.stringify(args)
                }
            }).then(function (tx) {
                if (ret._then) ret._then(tx);
            }).catch(function (err) {
                if (ret._catch) ret._catch(err);
            });
        })(ret);
        return ret;
    }
};

module.exports = new LocAccount();

