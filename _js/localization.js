/**
 * Created by mac on 2018/2/1.
 */

var locs = require('./loc.json');

var language;
if (navigator.language) {
	language = navigator.language;
} else {
	language = navigator.browserLanguage;
}

function initialize() {
	$('*[data-text]').each(function(){
		var ele = $(this);
		ele.text(loc(ele.attr('data-text')));
	});
	$('*[data-placeholder]').each(function () {
		var ele = $(this);
		ele.attr('placeholder', loc(ele.attr('data-placeholder')));
	});
}

function loc(text) {
	return initialize.words[text] || text;
}
initialize.loc = loc;

if (/^zh/.test(language)) {
	initialize.words = locs['zh-CN'];
}else {
	initialize.words = locs['en'];
}

module.exports = initialize;
