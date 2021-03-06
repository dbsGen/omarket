/**
 * Created by mac on 2018/5/15.
 */

var loc = require('./localization');
var TimeFormat = require('./timeformat');

var HTML = '<a class="col-6 col-lg-3 col-md-4 app-card"><div class="title"><div class="cover"></div> <div class="info"> <div class="name"></div><div class="version"></div><div class="date"></div> </div> </div> <div class="des"></div><div class="enter-arrow"></div> </a>'

function Card(){
    this.$elem = $(HTML);
    this.$cover = this.$elem.find('.cover');
    this.$name = this.$elem.find('.name');
    this.$date = this.$elem.find('.date');
    this.$version = this.$elem.find('.version');
    this.$des = this.$elem.find('.des');

    var self = this;
    this.$elem.click(function () {
        return self.click();
    });
}

Card.prototype.setData = function (data) {
    this.$cover.css('background-image', "url('"+data.pic_address+"')");
    this.$name.text(data.name);
    var rel = data.releases[0];
    this.$version.text('v' + rel.version);
    this.$date.text(loc.loc('Last modified') + ":" + TimeFormat(new Date(data.last_timestamp * 1000), 'yyyy-MM-dd'));
    this.$elem.attr('href', 'apk/#'+data.owner+'/'+data.app_id);
    if (data.des) {
        this.$des.text(markdown.toHTML(data.des).replace(/\<[^\>]*\>/g, ''));
    }
    this.data = data;
};

Card.prototype.click = function () {
    localStorage.setItem('tmp_app_info', JSON.stringify(this.data));
    return true;
};

module.exports = Card;
