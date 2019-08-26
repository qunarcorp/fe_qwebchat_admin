/*
 * @author: yl.liu
 * @Date: 2015-10-18
 * @lastModify: yl.liu
 * @lastModifyDate: 2015-10-20
 * @description: 用于商户在线咨询管理平台客服管理页面，依赖avalon，oniui
 * @other：依赖avalon，oniui
 */
require('avalon');
require('avalonUI/dialog/avalon.dialog.js');
require('avalonUI/validation/avalon.validation.js');
require('avalonUI/smartgrid/avalon.smartgrid.js');
require('avalonUI/mmRequest/mmRequest.js');
// document.domain = "darlyn.com";
//自适应高度
require('./../../common/ifream/iframeAutoHeight.js');
var waiterList = require('./waiterList.js'),
	groupManage = require('./groupManage.js'),
	prdGroupMapping = require('./prdGroupMapping.js'),
	servicesSetting = require('./servicesSetting.js'),
	shopList = require('./shopList.js'),
	config = {
		businessList: '/sys/queryBusinessList.qunar', //查询所有的业务
		groupList: '/group/queryBusinessGroup.qunar' //查询所有的分组
	};
var vm = avalon.vmodels;

/*
 * 根据字段名获取URL地址上的参数值
 * uname
 */
function getQueryParam(name) {
	//获取url中的参数
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var rslt = window.location.search.substr(1).match(reg); //匹配目标参数
	if (rslt != null) {
		return decodeURI(rslt[2]);
	} else {
		return ''; //返回参数值
	}
};

//获取参数
var bType = getQueryParam("bType") || "";

var GMManage = {
	init: function() {
		avalon.config({
			debug: false
		});

		this.initAvalon();
        shopList.init();
		waiterList.init();
		groupManage.initAvalon();
		prdGroupMapping.init();
		servicesSetting.init();

		avalon.scan();
	},

	initAvalon: function() {
		var GMManage = avalon.define({
			$id: 'GMManage',
			$skipArray: ['dialog', '$waiterList', '$shopList'],
			tabName: 'shopList',
            // 业务线数据
			shopList: shopList,
			waiterList: waiterList,
			groupManage: groupManage,
			prdGroupMapping: prdGroupMapping,
			servicesSetting: servicesSetting,
			shopListRender: true,
			waiterListRender: true,
			groupManageRender: false,
			prdGroupMappingRender: false,
			hasRenderChecked: false,
			suList: window.suList,
			//分组
			groupsList: [],
			//业务
			businessList: [],
			//排队策略
			sortMethods: [],
			//通用alert
			$alertDlg: {
				title: '提示：',
				width: 280,
				type: 'alert'

			},
			isSupplierService: window.isSupplierService,
			// 跳转智能机器人
			toSmartConsult: function() {
				var bType = document.cookie.match(/(^|\s)QChat_bType=([^;]*)(;|$)/i),
					_bType;
				if (bType && bType.length && bType[2].replace(/"/g, '')) {
					_bType = bType[2];
				}
				location.href = '/sys/smartConsult.do?bType=' + _bType;
			},
			toSupplierFAQ: function() {
				location.href = '/sys/supplierFAQ.do?bType=' + window.bType;
			},

			//会话管理
			toSessionManage: function() {
				var bType = document.cookie.match(/(^|\s)QChat_bType=([^;]*)(;|$)/i),
					bSuId = document.cookie.match(/(^|\s)QChat_bSuId=([^;]*)(;|$)/i),
					_bType,
					_bSuId;
				if (bType && bType.length && bType[2].replace(/"/g, '')) {
					_bType = bType[2];
				}
				if (bSuId && bSuId.length && bSuId[2].replace(/"/g, '')) {
					_bSuId = bSuId[2];
				}
				if (_bType && _bSuId) {
					document.location.href = './sessionList.do?bType=' + _bType + '&bSuId=' + _bSuId;
				} else if (_bType && !_bSuId) {
					document.location.href = './sessionList.do?bType=' + _bType;
				} else if (!_bType && _bSuId) {
					document.location.href = './sessionList.do?bSuId=' + _bSuId;
				} else {
					document.location.href = './sessionList.do'
				}

			},
			//tab切换
			changeTab: function() {
				var param = this.getAttribute('data-rel'),
					thisLi = this.parentElement,
					oLi = thisLi.parentElement.getElementsByTagName('li'),
					len = oLi.length;

				GMManage.changeActive.call(this, oLi, thisLi);
				GMManage.tabName = param;

				//模拟延迟加载
				if (!GMManage[param + 'Render']) {
					GMManage[param].init();
					GMManage[param + 'Render'] = true;
				}
			},
			//active切换
			changeActive: function(removeActiveObj, addActiveObj) {
				var len = removeActiveObj.length;
				while (len--) {
					avalon(removeActiveObj[len]).removeClass('active');
				}
				avalon(addActiveObj).addClass('active');
			},

			//改变策略和分组
			changeClassify: function() {
				var thisLi = this.parentElement,
					oLi = thisLi.parentElement.getElementsByTagName('li');
				GMManage.changeActive.call(this, oLi, thisLi);
			},
			showAlert: function(content) {
				avalon.vmodels.$alertDlg.setContent(content);
				avalon.vmodels.$alertDlg.toggle = true;

			},
			//渲染选择后的样式
			renderChecked: function() {
				var checkedStyle = '[data-ischecked="1"]{border: 1px solid #01da44;background:#ccc}',
					head = document.getElementsByTagName('head')[0],
					style = document.createElement('style');
				style.innerHTML = checkedStyle;
				head.appendChild(style);
				vm.GMManage.hasRenderChecked = true;
			},
			//显示弹窗
			showDialog: function(id, title, tpl) {
				if (title) {
					avalon.vmodels[id].title = title;
				}
				if (tpl) {
					avalon.vmodels[id].setContent(tpl);
				}
				avalon.vmodels[id].toggle = true;
			},
			//添加/编辑客服
			addGMDialog: function(id, title) {
				avalon.vmodels.GMManage.showDialog(id, title, editGMTpl);
				avalon.scan();
			},
			//删除客服
			removeGM: function() {
				var id = this.getAttribute('data-id'),
					qunarName = this.getAttribute('data-qunarName');
				GMManage.showDialog('$rmgm');
				GMManage.qunarName = qunarName;
				GMManage.qunarId = id;
			},
			//接口访问失败的回调
			error: function(result) {
				GMManage.showAlert(result.msg);
			}
		});
	}
};
GMManage.init();