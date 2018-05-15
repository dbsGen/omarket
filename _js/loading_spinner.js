/**
 * Created by mac on 2018/2/4.
 */

function LoadingSpinner() {
	this.status = LoadingSpinner.LOADING;
	this.LOADING = 0;
	this.CHECKED = 1;
	this.FAILED = 2;
}

LoadingSpinner.HTML = '<div id="loadingCell"></div>';
LoadingSpinner.LOADING = 0;
LoadingSpinner.CHECKED = 1;
LoadingSpinner.FAILED = 2;

LoadingSpinner.prototype.show = function (status, msg) {
	if (!this.$elem) {
		this.$elem = $(LoadingSpinner.HTML);
		$('body').append(this.$elem);
		this.children = [];
		this.$loading = $('<div class="loading" style="display: none"></div>');
		this.$elem.append(this.$loading);
		this.$check = $('<div class="octicon octicon-check text-success" style="display: none"></div>');
		this.$elem.append(this.$check);
		this.$failed = $('<div class="octicon octicon-x text-danger" style="display: none"></div>');
		this.$elem.append(this.$failed);
		this.$text = $('<div class="text"></div>');
		this.$elem.append(this.$text);
		this.$elem.css('right', '-10px');
		this.$elem.css('opacity', '0');
		this.children.push(this.$loading);
		this.children.push(this.$check);
		this.children.push(this.$failed);
	}
	if (this.timer) clearTimeout(this.timer);
	status = status || LoadingSpinner.LOADING;
	this.children[status].css('display', 'block');
	this.setStatus(status, msg);
};

LoadingSpinner.prototype.miss = function (delay) {
	delay = delay || 0;
	var self = this;
	if (this.timer) clearTimeout(this.timer);
	this.timer = setTimeout(function () {
		self.$elem.stop();
		self.$elem.animate({
			right: '-10px',
			opacity: '0'
		}, 600, function() {
			self.$check.css('display', 'none');
			self.$failed.css('display', 'none');
			self.$text.css('display', 'none');
		});
		self.timer = null;
	}, delay);
};

LoadingSpinner.prototype.setStatus = function (status, msg) {
	if (status != this.status && this.$elem) {
		var old = this.status;
		this.status = status;
		if (this.children[old]) {
			this.children[old].fadeOut("fast");
		}
		if (this.children[this.status]){
			this.children[this.status].fadeIn("fast");
		}
	}
	msg = msg||'';
	var width = 0;
	if (this.$text.text() != msg) {
		this.$text.text(msg);
		width = this.$text.width();
	}
	if (status === LoadingSpinner.FAILED) {
		this.$text.removeClass('text-success');
		this.$text.addClass('text-danger');
	}else if (status === LoadingSpinner.CHECKED) {
		this.$text.addClass('text-success');
		this.$text.removeClass('text-danger');
	}else {
		this.$text.removeClass('text-success');
		this.$text.removeClass('text-danger');
	}
	if (msg.length > 0) {
		this.$text.css('display', 'inline');
	}
	this.$elem.stop();
	this.$elem.animate({
		right: (width + 20) + 'px',
		opacity: '1'
	}, 600);
};

module.exports = new LoadingSpinner();
