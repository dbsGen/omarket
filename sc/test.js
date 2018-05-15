/**
 * Created by mac on 2018/5/15.
 */

function OpenMarket() {
}

OpenMarket.prototype = {
    init: function () {
        LocalContractStorage.put("storage_size",0);
    },
    get_id: function () {
        return LocalContractStorage.get('storage_size');
    },
    set_id: function (val) {
        return LocalContractStorage.put('storage_size', val);
    }
};

module.exports = OpenMarket;