/**
 * Created by mac on 2018/5/7.
 */

function ConsoleOutput($elem) {
    this.$elem = $elem;
}

ConsoleOutput.prototype.error = function (val) {
    if (typeof(val) === "string") {
        this._input("<div class='out-error'>"+val+"</div>");
    }else if (val instanceof HTMLElement) {
        this._input("<div class='out-error'>"+$(val).html()+"</div>");
    }else {
        this._input("<div class='out-error'>"+JSON.stringify(val)+"</div>")
    }
};

ConsoleOutput.prototype.log = function (val) {
    if (typeof(val) === "string") {
        this._input("<div class='out-log'>"+val+"</div>");
    }else if (val instanceof HTMLElement) {
        this._input("<div class='out-log'>"+$(val).html()+"</div>");
    }else {
        this._input("<div class='out-log'>"+JSON.stringify(val)+"</div>")
    }
};

ConsoleOutput.prototype.warn = function (val) {
    if (typeof(val) === "string") {
        this._input("<div class='out-warn'>"+val+"</div>");
    }else if (val instanceof HTMLElement) {
        this._input("<div class='out-warn'>"+$(val).html()+"</div>");
    }else {
        this._input("<div class='out-warn'>"+JSON.stringify(val)+"</div>")
    }
};

ConsoleOutput.prototype._input = function (val) {
    val = val.replace('\n', '<br/>');
    var $div = $(val);
    $div.hide();
    this.$elem.prepend($div);
    $div.slideDown();
};

ConsoleOutput.prototype.html = function (val) {
    var $div = $(val);
    $div.hide();
    this.$elem.prepend($div);
    $div.slideDown();
};

module.exports = ConsoleOutput;
