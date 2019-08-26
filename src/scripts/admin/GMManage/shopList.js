var editShopTpl = require('../template/editShopM.string'),
    validationConfig = require('jsCommon/validationConfig.js'),
    config = {
        ShopList: '/busiSupplier/pageQuerySupplierList.json', // 查询客服列表
        searchShopList: '/busiSupplier/getBusiSupplierByBusiName.json',
        editShop: '/busiSupplier/setBusiSupplier.json', // 添加、编辑客服
        checkShopName: '/seat/checkShopName.qunar' // 验证店铺名是否重复
    },
    vm = avalon.vmodels;
var ShopList = {
    init: function() {
        this.initAvalon();
        this.addValidationRule();
    },

    initAvalon: function() {
        var me = this,
            GMManage = vm.GMManage;
        avalon.define({
            $id: 'shopList',
            $skipArray: ['$editShop', '$shopList'],
            startX: '',
            startY: '',
            // 业务线数据
            // lineOptions: [{"name":"苹果","id":"1"}, {"name":"香蕉","id":"2"}, {"name":"桃子","id":"3"}, {"name":"雪梨","id":"4"}],
            // lineSelected: "2",
            // 当前删除的信息
            qunarName: '',
            // 是否为添加操作
            isAdd: true,
            // rowSuList: [],
            // sowSuListLen: 0,
            // userName: '',
            // qunarId: '',
            // 搜索条件
            GMdata: {
                busiSupplierName: '',
                pageSize: 15,
				pageNum: 1
            },
            closeDialog: false,
            // 编辑客服
            rowData: [],
            $shopList: {
                autoResize: false,
                htmlHelper: {
                    groupHtml: function(vmId, field, index, cellValue, rowData) {
                        var len = cellValue ? cellValue.length : 0,
                            html = '',
                            groupLen;

                        while (len--) {
                            groupLen = cellValue[len]['groupList'] ? cellValue[len]['groupList'].length : 0;
                            if (groupLen > 0) {
                                while (groupLen--) {
                                    html += '<span   class="pd5">' + cellValue[len]['groupList'][groupLen]['name'] + '</span>';
                                }
                            }
                        }
                        return html;
                    },
                    queueState: function (vmId, field, index, cellValue, rowData) {
                        return cellValue?'排队已开启':'排队未开启';
                    },
                    shopStatusHtml: function (vmId, field, index, cellValue, rowData) {
                        return cellValue?'服务中':'已下架';
                    },
                    createTimehtml: function(vmId, field, index, cellValue, rowData) {
                        if (cellValue) {
                            var time = new Date(cellValue);
                            return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate();
                        }
                        return '';
                    },
                    operateHtml: function(vmId, field, index, cellValue, rowData) {
                        return '<a href="javascript:void(0)" data-shopName="' + rowData.name + '" data-id="' + rowData.id + '" data-queueState="' + rowData.ext_flag + '" data-shopState="' + rowData.status + '"data-rel="' + index + '"data-assignstragegy="' + rowData.assignStrategy +'" ms-click="editShop" class="pd5">编辑</a>';
                    },
                    strategyHtml: function(vmId, field, index, cellValue, rowData){
                        var result;
                        switch (cellValue){
                            case 1: 
                                result = '轮询';
                                break;
                            case 2:
                                result = '最闲优先';
                                break;
                            case 3:
                                result = '随机';
                                break;
                            default:
                                result = '';
                        }
                        return result;
                    }
                },
                columns: [{
                    key: 'busiType', // 列标识
                    name: '业务线', // 列名
                    sortable: false, // 是否可排序
                    isLock: true, // 是否锁死列让其始终显示
                    align: 'center', // 列的对象方式
                    defaultValue: '数据错误', // 列的默认值
                    toggle: true, // 控制列的显示隐藏
                    width: 120
                }, {
                    key: 'id',
                    name: '店铺ID',
                    sortable: false,
                    width: 120
                }, {
                    key: 'name',
                    name: '店铺名称',
                    sortable: false,
                    width: 200,
                }, {
                    key: 'status',
                    name: '店铺状态',
                    sortable: false,
                    width: 120,
                    format: 'shopStatusHtml',
                }, {
                    key: 'assignStrategy',
                    name: '分配策略',
                    sortable: false,
                    width: 120,
                    format: 'strategyHtml'
                },{
                    key: 'ext_flag',
                    name: '排队状态',
                    sortable: false,
                    width: 120,
                    format: 'queueState',
                }, {
                    key: 'createDate',
                    name: '创建日期',
                    sortable: false,
                    width: 160,
                    format: 'createTimehtml'
                }, {
                    name: '操作',
                    sortable: false,
                    width: 140,
                    format: 'operateHtml'
                }],
                data: [],
                pager: {
                    perPages: 15,
                    totalItems: 100,
                    showPages: 5,
                    onJump: function(e, page) {
                        vm.shopList.GMdata.pageNum = page.currentPage;
                        vm.shopList.getShopList();
                    }
                }
            },
            // 编辑店铺弹窗
            $editShop: {
                title: '',
                content: '',
                width: 450,
                onConfirm: function() {
                    me.validateObj.validateAll();
                    return false;
                },
                onCancel: function() {
                    me.deleteEditVm();
                },
                onClose: function() {
                    me.deleteEditVm();
                }
            },
            // 获取客服列表
            getShopList: function() {
                ShopList.getShopList()
                    .done(function(result) {
                        if (result.ret) {
                            var $shopList = vm.$shopList,
                                data = result.data ? result.data.supplierList : [];

                            $shopList.render(data);
                            $shopList.pager.totalItems = result.data.totalCount;
                        } else {
                            GMManage.error(result);
                        }
                    })
                    .fail(function(){
                        GMManage.error();
                    });
            },

            searchShopList: function () {
                ShopList.searchShopList()
                    .done(function(result) {
                        if (result.ret) {
                            var $shopList = vm.$shopList,
                                data = result.data ? result.data : [];

                            $shopList.render(data);
                            $shopList.pager.totalItems = result.data.length;
                        } else {
                            GMManage.error(result);
                        }
                    })
                    .fail(GMManage.error);
            },

            // 编辑、添加店铺
            editShop: function() {
                var thisVm = vm.shopList,
                    me = ShopList,
                    title = this.getAttribute('data-rel') ? '编辑店铺' : '添加店铺';

                thisVm.isAdd = this.getAttribute('data-rel') ? false : true;
                me.initEditAvalon();
                vm.editShop.datas.busiSupplierId = this.getAttribute('data-id') || '';
                vm.editShop.datas.name = this.getAttribute('data-shopName') || '';
                // vm.editShop.datas.line = '2';
                vm.editShop.datas.status = this.getAttribute('data-shopstate') ? parseInt(this.getAttribute('data-shopstate')) : true;
                vm.editShop.datas.extFlag = this.getAttribute('data-queuestate')? parseInt(this.getAttribute('data-queuestate')) :  true;
                vm.editShop.datas.assignStragegy = this.getAttribute('data-assignstragegy') || '';
                // vm.editShop.datas.createTime = 0;
                // vm.editGM.datas.busiList = this.getAttribute('data-busiList');
                if (thisVm.isAdd) {
                    GMManage.showDialog('$editShop', title, editShopTpl);
                    me.validateObj = vm.$editShopDlg;
                    me.editObj = vm.editShop;
                    if (!GMManage.hasRenderChecked) {
                        GMManage.renderChecked();
                    }
                } else {
                    GMManage.showDialog('$editShop', title, editShopTpl);
                    me.validateObj = vm.$editShopDlg;
                    me.editObj = vm.editShop;
                    if (!GMManage.hasRenderChecked) {
                        GMManage.renderChecked();
                    }
                }
            }
        });
        avalon.nextTick(function() {
            avalon.scan();
            vm.shopList.getShopList();
        });
    },

    initEditAvalon: function() {
        var me = this;
        // 编辑店铺
        avalon.define({
            $id: 'editShop',
            $skipArray: ['validation'],
            datas: {
                busiSupplierId: '',
                name: '',
                status: 1,
                extFlag: 1,
                assignStragegy: 1
            },
            $editShopDlg: avalon.mix(validationConfig, {
                onValidateAll: function(reasons) {
                    reasons.forEach(function(reason) {
                        avalon(reason.element).removeClass('success').addClass('error');
                        validationConfig.showError(reason.element, reason);
                    });
                    if (reasons.length === 0) {
                        me.confirmEdit();
                    }
                }
            })
        });
        avalon.scan();
    },
    // 增加验证规则
    addValidationRule: function() {
        validationConfig.addRule('shopName', {
            message: '{{errerInfo}}',
            get: function(value, data, next) {
                if (!value) {
                    next(value === '');
                    return value;
                }
                avalon.ajax({
                    url: config.checkShopName,
                    type: 'POST',
                    data: {
                        p: value
                    },
                    dataType: 'json'
                })
                    .done(function(result) {
                        if (result.code === '100000') {
                            if (value !== result.data.userName) {
                                // var hasSuccess = data.element.getAttribute('data-success');
                                // data.data.errerInfo = ;
                                data.element.setAttribute('data-successInfo', '<em style="color:#339900">客服关联用户名为:'+ result.data.userName +'</em>');
                                vm.waiterList.userName = result.data.userName;
                            }
                            next(true);
                            return;
                        } else if (result.code === '200000') {
                            data.data.errerInfo = '客服已经存在';
                        } else if (result.code === '200001') {
                            data.data.errerInfo = '该用户不存在';
                        } else {
                            data.data.errerInfo = '无法添加客服，请稍后再试';
                        }
                        next(false);
                    })
                    .fail(function(result) {
                        next(result.userName === '');
                        data.data.errerInfo = '无法添加客服，请稍后再试';
                    });
                return value;
            }
        });
    },

    // 请求店铺列表
    getShopList: function() {
        var params = avalon.mix({}, vm.shopList.GMdata.$model);
        return 	avalon.ajax({
            url: config.ShopList,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
    },

    searchShopList: function () {
        var params = avalon.mix({}, vm.shopList.GMdata.$model);
        if (params.busiSupplierName.length <= 0) {
            return 	avalon.ajax({
                url: config.ShopList,
                type: 'GET',
                data: params,
                dataType: 'json'
            });
        } else {
            return 	avalon.ajax({
                url: config.searchShopList,
                type: 'GET',
                data: params,
                dataType: 'json'
            });
        }
    },

    clearSearchInfo: function() {
        vm.shopList.GMdata.qunarName = '';
        vm.shopList.GMdata.webName = '';
        vm.shopList.GMdata.busiType = '';
    },

    //删除编辑相关vm
    deleteEditVm: function() {
        // vm.$editShop.setContent('');
        // delete vm.$editShop;
        // delete vm.$editShopDlg;
    },

    // 添加编辑店铺之后的回调
    confirmEdit: function(operate) {
        var me = this;
        var params = avalon.mix({}, vm.editShop.datas.$model);
        params.extFlag = params.extFlag?"1":"0";
        // delete params.extFlag;
        avalon.ajax({
            url: config.editShop,
            type: 'GET',
            data: params,
            dataType: 'json'
        })
            .done(function(result) {
                if (result.ret) {
                    me.clearSearchInfo();
                    vm.shopList.getShopList();
                    // 触发onClose
                    vm.$editShop._close();
                } else {
                    vm.$editShop._close();
                }
                vm.GMManage.error(result);
            })
            .fail(function() {
                // 多个弹窗共用一个遮罩层，需改变zindex
                vm.$editShop._close();
                vm.GMManage.showAlert(vm.$editShop.title + '失败，请稍后再试');
            });
    }
};

module.exports = ShopList;