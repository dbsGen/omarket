/**
 * Created by mac on 2018/5/14.
 */
var loc = require('./localization');
var ConsoleOutput = require('./console_output');
var LoadingSpinner = require('./loading_spinner');

loc();

var $alert = $('#alert');
var Account = require('./account');

function AppItem(app_id) {
    this.app_id = app_id;
    this.elem = document.createElement('tr');
    this.elem.innerHTML = '<td>'+app_id+'</td>';
    var actionElem = document.createElement('td');

    var self = this;
    this.selectElem = document.createElement('a');
    this.selectElem.setAttribute('href', 'javascript:void(0)');
    this.selectElem.innerText = loc.loc('Select');
    this.selectElem.onclick = function () {
        self.onSelect();
    };
    actionElem.appendChild(this.selectElem);

    this.elem.appendChild(actionElem);
}

AppItem.prototype.onSelect = function () {
    requestApp(this.app_id);
};

setTimeout(function () {
    if (!Account.account) {
        showAlert(loc.loc('Not login') + ' <a href="https://github.com/ChengOrangeJu/WebExtensionWallet" target="_blank">Plugin</a>');

    }
}, 1000);

var consoleDiv = new ConsoleOutput($('#output'));
var $postForm = $('#postForm'), $appName = $('#appName');
var $appPic = $('#appPic'), $appVersion = $('#appVersion');
var $appAppID = $('#appAppID'), $appAddress = $('#appAddress');
var  $appSubmit = $('#appSubmit'), $myApps = $('#myApps');
var $appDes = $('#appDes'), $postPos = $('#post-pos');
$postForm.on('submit', function () {
    if (Account.account) {

        var arr = $postForm.serializeArray();
        var data = {};
        for (var i = 0, t = arr.length; i < t; ++i) {
            var d = arr[i];
            data[d.name] = d.value;
        }

        if (data.appName.trim().length === 0) {
            showAlert(loc.loc('Lack of name'));
            return false;
        }
        if (data.appPic.trim().length === 0) {
            showAlert(loc.loc('Lack of cover'));
            return false;
        }
        if (data.appAppID.trim().length === 0) {
            showAlert(loc.loc('Lack of app id'));
            return false;
        }
        if (data.appDes.trim().length === 0) {
            showAlert(loc.loc('Lack of des'));
            return false;
        }

        Account.transaction('post',
            data.appType,
            data.appName,
            data.appAppID,
            data.appVersion,
            data.appAddress,
            data.appPic,
            data.appDes,
            data.appVisible === 'visible').then(function (res) {
            consoleDiv.log(loc.loc('Success') + " : " + data.appName + "("+data.appAppID+") v:" + data.appVersion);
            $appName.val('');
            $appPic.val('');
            $appVersion.val('');
            $appAppID.val('');
            $appAddress.val('');
            $appDes.val('');
            $appDes.val('');
            var vis = $('#visible');
            vis.prop("checked", "checked");
            vis.parent().addClass('active');
            $('#disable').parent().removeClass('active');
        }).catch(function (err) {
            consoleDiv.error(loc.loc('Failed') + " : " + JSON.stringify(err));
        });
    }else {
        showAlert(loc.loc('Not login') + ' <a href="https://github.com/ChengOrangeJu/WebExtensionWallet" target="_blank">Plugin</a>');

    }

    return false;
});

function showAlert(html) {
    consoleDiv.error(html);
}

Account.onAccount = function (account) {
    LoadingSpinner.show(LoadingSpinner.LOADING);
    Account.locCall('myApps').then(function (res) {
        var json = JSON.parse(res.result);
        if (json) {

            var $myAppsBody = $('#myAppsTable').find('tbody');
            for (var i = 0, t = json.length; i < t; ++i) {
                var item = new AppItem(json[i]);
                $myAppsBody.append(item.elem);
            }
            $myApps.slideDown();
        }
        LoadingSpinner.setStatus(LoadingSpinner.CHECKED);
        LoadingSpinner.miss(600);
    }).catch(function (err) {
        LoadingSpinner.setStatus(LoadingSpinner.FAILED);
        LoadingSpinner.miss(600);
    });
};


function requestApp(app_id) {
    LoadingSpinner.show(LoadingSpinner.LOADING);
    Account.locCall('fetchOne', Account.account + '/' + app_id).then(function (res) {
        var json = JSON.parse(res.result);
        setData(json);
        LoadingSpinner.setStatus(LoadingSpinner.CHECKED);
        LoadingSpinner.miss(600);
    }).catch(function (err) {
        LoadingSpinner.setStatus(LoadingSpinner.FAILED);
        LoadingSpinner.miss(600);
    });
}


function setData(data) {
    $appName.val(data.name);
    $appPic.val(data.pic_address);
    $appAppID.val(data.app_id);
    $appDes.val(data.des);
    var off = $postPos.offset();
    if (data.visible) {
        var vis = $('#visible');
        vis.prop("checked", "checked");
        vis.parent().addClass('active');
        $('#disable').parent().removeClass('active');
    }else {
        var vis = $('#disable');
        vis.prop("checked", "checked");
        vis.parent().addClass('active');
        $('#visible').parent().removeClass('active');
    }
    window.scrollTo(0,off.top);
}

$('#preView').click(function () {
    if (!Account.account) return false;
    var arr = $postForm.serializeArray();
    var data = {};
    for (var i = 0, t = arr.length; i < t; ++i) {
        var d = arr[i];
        data[d.name] = d.value;
    }
    if (data.appName.trim().length === 0) {
        showAlert(loc.loc('Lack of name'));
        return false;
    }
    if (data.appPic.trim().length === 0) {
        showAlert(loc.loc('Lack of cover'));
        return false;
    }
    if (data.appAppID.trim().length === 0) {
        showAlert(loc.loc('Lack of app id'));
        return false;
    }
    if (data.appDes.trim().length === 0) {
        showAlert(loc.loc('Lack of des'));
        return false;
    }

    var data = {
        owner: Account.account,
        name: data.appName,
        pic_address: data.appPic,
        app_id: data.appAppID,
        des: data.appDes,
        test: true,
        releases: [{
            version: data.appVersion,
            address: data.appAddress
        }]
    };
    localStorage.setItem('tmp_app_info', JSON.stringify(data));
    this.setAttribute('href', 'apk/#'+data.owner+'/'+data.app_id);
    return true;
});
