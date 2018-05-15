/**
 * Created by mac on 2018/5/14.
 */

var loc = require('./localization');
var Account = require('./account');
var Card = require('./card');
var LoadingSpinner = require('./loading_spinner');

loc();

var $navAndroid = $('#navAndroid'), $navDapp = $('#navDapp');
var $appContainer = $('#appContainer');

var apps = {};
var AND = 'android', DAPP = 'dapp';
var current_type = 'android';

$navAndroid.click(function () {
    $navAndroid.parent().addClass('active');
    $navDapp.parent().removeClass('active');
    if (current_type !== AND) {
        current_type = AND;
        $appContainer.empty();
        if (!apps[current_type]) {
            fetch(current_type, false);
        }else {
            var cards = apps[current_type];
            for (var i = 0, t = cards.length; i < t; ++i) {
                $appContainer.append(cards[i].$elem);
            }
        }
    }
});
$navDapp.click(function () {
    $navDapp.parent().addClass('active');
    $navAndroid.parent().removeClass('active');
    if (current_type !== DAPP) {
        current_type = DAPP;
        $appContainer.empty();
        if (!apps[current_type]) {
            fetch(current_type, false);
        }else {
            var cards = apps[current_type];
            for (var i = 0, t = cards.length; i < t; ++i) {
                $appContainer.append(cards[i].$elem);
            }
        }
    }
});

function fetch(type, clear) {
    LoadingSpinner.show(LoadingSpinner.LOADING);
    Account.locCall('fetch', null, type).then(function (res) {
        var datas = apps[type];
        if (!datas) {
            apps[type] = datas = [];
        }
        if (clear) {
            datas.splice(0, datas.length);
            $appContainer.empty();
        }
        var results = JSON.parse(res.result);
        for (var i = 0, t = results.length; i < t; ++i) {
            var card = new Card();
            card.setData(results[i]);
            datas.push(card);
            if (current_type == type) {
                $appContainer.append(card.$elem);
            }
        }

        LoadingSpinner.show(LoadingSpinner.CHECKED);
        LoadingSpinner.miss(600);
    }).catch(function (err) {
        console.log(err);
        LoadingSpinner.show(LoadingSpinner.FAILED);
        LoadingSpinner.miss(600);
    });
}

fetch('android', false);
