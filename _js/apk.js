/**
 * Created by mac on 2018/5/15.
 */

var loc = require('./localization');
var Account = require('./account');
var LoadingSpinner = require('./loading_spinner');
var TimeFormat = require('./timeformat');
var ConsoleOutput = require('./console_output');
var label = "xyn-" + Math.random() + Date.now();
var ipfs = new Ipfs({ repo: label});

loc();

var $title = $('#title');
var $appCover = $('.app-cover'), $appName = $('.app-name'), $appDate = $('.app-date');
var $appDes = $('.app-des'), $appOwner = $('.app-owner');
var $downloadButton = $('#downloadButton');
var consoleDiv = new ConsoleOutput($('#console'));
var appData, currentVersion;
var $releasesPopover = $('#releasesPopover'), $versionsButton = $('#versionsButton');
var $versionCode = $('#versionCode');

function setData(data) {
    appData = data;
    $title.text(data.name);
    $appCover.css('background-image', "url('"+data.pic_address+"')");
    $appName.text(data.name);
    $appOwner.text(loc.loc('Uploader')+':'+data.owner);
    $appDate.text(loc.loc('Last modified')+':'+TimeFormat(new Date(data.last_timestamp * 1000), 'yyyy-MM-dd'));
    if (data.des) {
        $appDes.text(markdown.toHTML(data.des));
    }
    currentVersion = appData.releases[0];
    updateVersion(currentVersion);

    var $releaseBody = $releasesPopover.find('.popover-body');
    for (var i = 0, t = appData.releases.length; i < t; ++i) {
        var release = appData.releases[i];
        var vlink = $('<a href="javascript:void(0)" data-index="'+i+'">v'+release.version+'</a>');
        vlink.click(function () {
            var idx = parseInt(this.getAttribute('data-index'));
            if (idx < appData.releases.length) {
                currentVersion = appData.releases[idx];
                updateVersion(currentVersion);
            }
        });
        $releaseBody.append(vlink);
    }
}
var arr = location.hash.replace(/^\#/, '').split('/');

var cur = localStorage.tmp_app_info;
var data = null;
if (cur) data = JSON.parse(cur);
if (arr.length >= 2) {
    if (data && data.owner === arr[0] && data.app_id === arr[1]) {
        setData(data);
    }else {
        LoadingSpinner.show(LoadingSpinner.LOADING);
        Account.locCall('fetchOne', arr[0] +'/'+arr[1])
            .then(function (res) {
                var json = JSON.parse(res.result);
                setData(json);
                LoadingSpinner.setStatus(LoadingSpinner.CHECKED);
                LoadingSpinner.miss(600);
            })
            .catch(function (err) {
                LoadingSpinner.setStatus(LoadingSpinner.FAILED);
                LoadingSpinner.miss(600);
            });
    }
}

function updateVersion(r) {
    $versionCode.text('v' + r.version);
}

var ready = false;
ipfs.on('ready', function () {
    ready = true;
});

var $spin = $downloadButton.find('.spin');
$downloadButton.click(function () {
    if (ready && appData) {
        startLoading();
        consoleDiv.$elem.slideDown();

        fetchIpfs(currentVersion.address);

    }
});

function startLoading() {
    $downloadButton.attr('disabled', 'disabled');
    $spin.css('display', 'inline-block');
}

var waitTimer;

function fetchIpfs(hash) {
    consoleDiv.log("Fetch info : ipfs/" + hash);

    waitTimer = setTimeout(function () {
        var str = "You can try the direct links:<br>";
        str += "<a href='https://ipfs.leiyun.org/ipfs/"+hash+"' target='_blank'>https://ipfs.leiyun.org/ipfs/"+hash+"</a><br>";
        str += "<a href='https://ipfs.io/ipfs/"+hash+"' target='_blank'>https://ipfs.io/ipfs/"+hash+"</a><br>";
        str += "<a href='https://gateway.ipfs.guide/ipfs/"+hash+"' target='_blank'>https://gateway.ipfs.guide/ipfs/"+hash+"</a><br>";
        consoleDiv.log(str);
    }, 5000);

    ipfs.object.get(hash, function (err, res) {
        if (err) {
            consoleDiv.error("Failed : " + err);
        }else {
            var single;
            if (res.links.length === 0) {
                single = true;
            }else {
                var first = res.links[0];
                if (first.name.length === 0) {
                    single = true;
                }else {
                    single = false;
                }
            }
            if (single) {
                consoleDiv.log("Got info " + res.size/1000 + "kb");
                ipfs.files.cat(hash, function (err, file) {
                    if (err) {
                        consoleDiv.error("Failed : " + err);
                    }else {
                        var blob = new Blob(file, {type: "octet/stream"});
                        var elem = document.createElement('div');
                        elem.innerText = "Got : ";
                        elem.className = 'out-log';
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        elem.appendChild(link);
                        consoleDiv.html(elem);
                        link.click();
                        if (waitTimer) {
                            clearTimeout(waitTimer);
                        }
                    }
                });
            }else {
                consoleDiv.error("Failed : no single file.");
            }
        }
    });
}

function stopLoading() {
    $downloadButton.removeAttr('disabled');
    $spin.css('display', 'none');
}

var releasePop = false;
document.onclick = function () {
    if (releasePop) {
        $releasesPopover.slideUp();
        releasePop = false;
    }
};

$versionsButton.click(function () {
    if (releasePop) return;
    var rect = $versionsButton[0].getBoundingClientRect();
    $releasesPopover.css('left',rect.left + 'px');
    $releasesPopover.css('top', rect.bottom + 'px');
    $releasesPopover.slideDown();

    setTimeout(function () {
        releasePop = true;
    }, 100);
});
