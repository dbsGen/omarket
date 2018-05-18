/**
 * Created by mac on 2018/5/16.
 */

function Comment(data) {
    this.data = data;
    this.$elem = $('<div class="comment"><div class="comment-owner"></div><div class="comment-content"></div> </div>');
    this.$owner = this.$elem.find('.comment-owner');
    this.$content = this.$elem.find('.comment-content');
    this.$owner.text(data.owner);
    this.$owner.attr('data-wallet', data.owner);
    Profiles.elem(this.$owner[0]);
    this.$content.html(markdown.toHTML(data.content));
}

module.exports = Comment;