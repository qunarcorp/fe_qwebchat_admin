/*
* @Author: 
* @Date:   2017-05-18 15:45:30
* @Last Modified by:   
* @Last Modified time: 2017-05-19 14:46:10
*/

'use strict';

var config = {
    getMsgUrl: '/notice/welcomes/list.json',
    saveMsgUrl: '/notice/save.json'
};

var servicesSetting = {
    init: function() {
        var sendData = [],
            shopNameMap = {},
            WIN = window,
            self = this;

        var vm = self.initAvalon();

        if (!WIN.suList || !WIN.suList.length) {
            return;
        }

        self.cacheList = [];
        $.each(suList, function(index, item) {
            sendData.push(item.id);
            shopNameMap[item.id] = item.name;
        });

        self.getMsgList({
            supplierIds: sendData.join()
        }).done(function(res) {
            if (res.ret && res.data && res.data.length) {
                var data = res.data;
                $.each(data, function(index, item) {
                    item.name = shopNameMap[item.supplierId];
                });
                vm.shopMessage = self.cacheList = data;
            }
        });
    },
    getMsgList: function(sendData) {
        return avalon.ajax({
            url: config.getMsgUrl,
            type: 'get',
            dataType: 'json',
            data: sendData
        });
    },
    initAvalon: function() {
        var GMManageVm = avalon.vmodels.GMManage,
            self = this;
        var vm = avalon.define({
            $id: 'servicesSetting',
            shopMessage: [],
            save: function() {
                var reqData = [];

                if(!self.cacheList){
                    return;
                }

                $.each(self.cacheList, function(index, item) {
                    reqData.push({
                        supplierId: item.supplierId,
                        welcomes: item.welcomes,
                        noServiceWelcomes: item.noServiceWelcomes
                    });
                });
                avalon.ajax({
                    url: config.saveMsgUrl,
                    type: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(reqData)
                }).done(function(res) {
                    if (res && res.ret) {
                        GMManageVm.showAlert(res.msg || '保存成功');
                    } else {
                        GMManageVm.showAlert(res.msg || '保存失败');
                    }
                }).fail(function() {
                    GMManageVm.showAlert('请求出错，保存失败');
                });
            }
        });
        avalon.scan();

        return vm;
    }
};

module.exports = servicesSetting;