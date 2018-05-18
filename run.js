/**
 * Created by mac on 2018/5/14.
 */

var browserify = require('browserify');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var debug = false;

var jsPaths = [
    "_js/index.js",
    "_js/post.js",
    "_js/apk.js"
];
for (var i = 0, t = jsPaths.length; i < t; ++i) {
    var path = jsPaths[i];
    var b = browserify();
    b.add(path);

    var bundle = b.bundle();

    var code = '';
    (function (code, path){
        if (debug) {
            var writable = fs.createWriteStream('./www/js/' + path.match(/\/([^\.]+)\.js$/)[1] + '.min.js');
            bundle.pipe(writable);
        }else {
            bundle.on("data", function (data) {
                code += data.toString('utf8');
            });
            bundle.on('end', function () {
                var result = UglifyJS.minify(code);
                var writable = fs.createWriteStream('./www/js/' + path.match(/\/([^\.]+)\.js$/)[1] + '.min.js');
                writable.write(result.code);
            });
        }
    })(code, path);
}
