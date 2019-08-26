/*
 * @author: nengting.jiang
 * @Date: 2017-04-06
 * @lastModify: nengting.jiang
 * @lastModifyDate: 2017-04-11
 * @description: 用于商户在线咨询管理平台 绑定微信
 * @other：依赖avalon，oniui
 */
require('avalon');
require('avalonUI/dialog/avalon.dialog.js');
require('avalonUI/smartgrid/avalon.smartgrid.js');
require('avalonUI/mmRequest/mmRequest.js');

var feedbackList = require('./feedbackList.js');

var api = {
		robotConfig: '/sys/saveRobotConfig.qunar',
		getDefaultQuestions: '/sys/ml/supplier_robot/config.qunar',
		updateDefaultQuestions: '/sys/ml/supplier_robot/update_config.qunar',
		getQAList: '/sys/ml/supplier_robot/qalist.qunar',
		updateQAList: '/sys/ml/supplier_robot/update_qa.qunar'
	},
	vm = avalon.vmodels;

//获取参数
var _q = document.cookie.match(/_q=([^;]*)(;|$)/i),
		username = _q && _q[1].slice(2) || '';

var currentRobot = window.suList[0] || {},
	defaultQuestion = ['', '', '', '', '', '', '', '', '', ''],
	reqData = {
		supplier_id: currentRobot.id,
		business_id: window.bType
	},
	isSupport = window.suList.length > 0;

var pageManage = {

	init: function() {
		this.initAvalon();
		feedbackList.init();
	},

	initAvalon: function() {
		var me = this,
			cacheQAList = [],
			cacheQuestionId = '';

		var pageManage = avalon.define({
			$id: 'pageManage',
			tabName: 'setting',
			$skipArray: ['$editQuestionDlg', 'smartQuestionList', '$feedbackList'],
			feedbackList: feedbackList,
			reqData: reqData,

			editStatus: {
        canEditSmartConsultSwitch: false,
        canEditDefaultQuestions: false
			},
			
			isSupport: isSupport,
      isSupplierService: window.isSupplierService,
            
      currentEditQuestion: {
				question1: '',
				question2: '',
				question3: '',
				answer: ''
			},
			
			shops: window.suList,
			
			args: {
				strategy: currentRobot.robotStrategy,
				welcomeMsg: currentRobot.robotWebcome,
				defaultQuestion: ['', '', '', '', '', '', '', '', '', '']
			},
      //通用alert
			$alertDlg: {
				title: '提示:',
				width: 280,
        type: 'alert'
      },
			$editQuestionDlg: {
				title: '编辑问题',
				type: 'confirm',
				width: 680,
				onConfirm: function() {
					pageManage.updateQAList();
				},
				onClose: function() {
				}
			},
			smartQuestionList: {
				autoResize: false,
				htmlHelper: {
					handleQuestion1: function(vmId, field, index, cellValue, rowData) {
						return cellValue[0] || '';
					},
					handleQuestion2: function(vmId, field, index, cellValue, rowData) {
						return cellValue[1] || '';
					},
					handleQuestion3: function(vmId, field, index, cellValue, rowData) {
						return cellValue[2] || '';
					},
					operateHtml: function(vmId, field, index, cellValue, rowData) {
						return '<a href="javascript:void(0)" class="opts" ms-click="editQuestion(\'' + index + '\')">编辑</a>' +
                            '<a href="javascript:void(0)" class="opts" ms-click="deleteQuestion(\'' + cellValue + '\')">删除</a>';
					}
				},
				columns: [{
					key: 'question',
					name: '问题',
					sortable: false,
					width: 150,
					format: 'handleQuestion1'
				}, {
					key: 'question',
					name: '近似问法1',
					sortable: false,
					width: 200,
					format: 'handleQuestion2'
				}, {
					key: 'question',
					name: '近似问法2',
					sortable: false,
					width: 200,
					format: 'handleQuestion3'
				}, {
					key: 'answer',
					name: '答案',
					sortable: false,
					width: 300
				}, {
					key: 'id',
					name: '操作',
					sortable: false,
					width: 100,
					format: 'operateHtml'
				}],
				data: [],
				pageable: false
			},
			
      showAlert: function(content) {
        vm.$alertDlg.setContent(content);
        vm.$alertDlg.toggle = true;
      },
            
			startEdit: function(type) {
					pageManage.editStatus[type] = true;
			},
			save: function(type) {
				// 阻止非编辑状态点击保存发送请求
				if (!pageManage.editStatus[type]) {
					return;
				}
				switch (type) {
					case 'canEditSmartConsultSwitch':
						pageManage.saveRobotConfig();
						break;
						
					case 'canEditDefaultQuestions':
						pageManage.saveRobotConfig();
						pageManage.updateDefaultQuestions();
						break;
				}
            },

			//tab切换
			changeTab: function() {
				var index = this.getAttribute('data-index'),
					thisLi = this.parentElement,
					oLi = thisLi.parentElement.getElementsByTagName('li');

				pageManage.changeActive.call(this, oLi, thisLi);
				currentRobot = window.suList[index];
				reqData.supplier_id = currentRobot.id;
				pageManage.args.strategy = currentRobot.robotStrategy;
				pageManage.args.welcomeMsg = currentRobot.robotWebcome;
				
				pageManage.getDefaultQuestions();
				pageManage.getQAList();
				vm.feedbackList.getFeedbackList();
				me.defaultFirstShopTab(thisLi);
				pageManage.tabName = 'setting'; 
			},

			//单个店铺tab切换
			changeShopTab: function() {
				var name = this.getAttribute('data-name'),
						thisLi = this.parentElement,
						oLi = thisLi.parentElement.getElementsByTagName('li');
				
				pageManage.tabName = name;
				pageManage.changeActive.call(this, oLi, thisLi);
			},

			//active切换
			changeActive: function(removeActiveObj, addActiveObj) {
				var len = removeActiveObj.length;
				while (len--) {
					avalon(removeActiveObj[len]).removeClass('active');
				}
				avalon(addActiveObj).addClass('active');
			},
			//跳转到客服管理頁面
			toWaiterManage: function() {
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
					document.location.href = '/sys/manage.do?bType=' + _bType + '&bSuId=' + _bSuId;
				} else if (_bType && !_bSuId) {
					document.location.href = '/sys/manage.do?bType=' + _bType;
				} else if (!_bType && _bSuId) {
					document.location.href = '/sys/manage.do?bSuId=' + _bSuId;
				} else {
					document.location.href = '/sys/manage.do';
				}
			},
			//绑定微信
			toWechat: function() {
				location.href = '/sys/wechat.qunar?bType=' + window.bType;
			},
			toSupplierFAQ: function() {
				location.href = '/sys/supplierFAQ.do?bType=' + window.bType;
			},
			editQuestion: function(index) {
				var current = cacheQAList[index],
					questions = current && current.question;
				cacheQuestionId = current && current.id;
					
				pageManage.currentEditQuestion = questions && {
					question1: questions[0] || '',
					question2: questions[1] || '',
					question3: questions[2] || '',
					answer: current.answer
				} || {
					question1: '',
					question2: '',
					question3: '',
					answer: ''
				};

				vm.$editQuestionDlg.toggle = true;
			},
			saveRobotConfig: function() {
				$.ajax({
					url: api.robotConfig,
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					data: JSON.stringify({
						robotname: currentRobot.robotName,
						supplierid: currentRobot.id,
						robotstrategy: pageManage.args.strategy,
						robotwelcome: pageManage.args.welcomeMsg
					})
				}).done(function(res) {
					if (res.ret) {
						currentRobot.robotWebcome = pageManage.args.welcomeMsg;
						pageManage.editStatus.canEditSmartConsultSwitch = false;
						pageManage.editStatus.canEditDefaultQuestions = false;
					}
				});
			},
			getDefaultQuestions: function() {
				$.ajax({
					url: api.getDefaultQuestions,
					type: 'GET',
					dataType: 'json',
					data: reqData
				}).done(function(res) {
					if (res.status === 0 && res.data && res.data.default_questions) {
						var data = res.data,
							originDefaultQuestion = [].concat(defaultQuestion);
						
						if (data.default_questions) {
							var questions = data.default_questions,
								len = questions.length;
							for (var i = 0; i < len; i++) {
								originDefaultQuestion[i] = questions[i];
							}
						}
						pageManage.args.defaultQuestion = originDefaultQuestion;
					}
				});
			},
			updateDefaultQuestions: function() {
				$.ajax({
					url: api.updateDefaultQuestions,
					type: 'POST',
					dataType: 'json',
					data: $.extend({}, reqData, {
						regard_words: encodeURIComponent(pageManage.args.welcomeMsg),
						operator: username,
						status: 1,
						default_questions: $.map(pageManage.args.defaultQuestion, function(value) {
							// 过滤出有效值
							return !!value ? encodeURIComponent(value) : null;
						}).join(',')
					})
				}).done(function(res) {
					if (res.ret) {
						pageManage.editStatus.canEditSmartConsultSwitch = false;
						pageManage.editStatus.canEditDefaultQuestions = false;
					}
				});
			},
			getQAList: function() {
				$.ajax({
					url: api.getQAList,
					type: 'GET',
					dataType: 'json',
					data: reqData
				}).done(function(res) {
					if (res.status === 0 && res.data && res.data.length) {
						cacheQAList = $.map(res.data, function(item) {
							return item.status !== 0 ? item : null;
						});
						vm.smartQuestionList.render(cacheQAList);
					}
				});
			},
			updateQAList: function() {
				var question1 = pageManage.currentEditQuestion.question1.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				var question2 = pageManage.currentEditQuestion.question2.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				var question3 = pageManage.currentEditQuestion.question3.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				var answer = pageManage.currentEditQuestion.answer

				if (!question1) {
					pageManage.showAlert('问题不能为空');
					return false
				}

				if (!answer) {
					pageManage.showAlert('答案不能为空');
					return false
				}

				var question = [];
				question1 && question.push(encodeURIComponent(question1));
				question2 && question.push(encodeURIComponent(question2));
				question3 && question.push(encodeURIComponent(question3));

				$.ajax({
					url: api.updateQAList,
					type: 'POST',
					dataType: 'json',
					data: $.extend(cacheQuestionId ? {
						id: cacheQuestionId
					} : {}, reqData, {
						question: question.join(','),
						answer: encodeURIComponent(answer)
					})
				}).done(function(res) {
					if (res.status === 0) {
						pageManage.getQAList();
					}
				}).always(function() {
					cacheQuestionId = '';
				});
			},
			deleteQuestion: function(id) {
				$.ajax({
					url: api.updateQAList,
					type: 'GET',
					dataType: 'json',
					data: $.extend({}, reqData, {
						id: id,
						status: 0
					})
				}).done(function(res) {
					if (res.status === 0) {
						pageManage.getQAList();
					}
				});
			}
		});

		avalon.nextTick(function() {
			if (!isSupport) {
				return;
			}
			pageManage.getDefaultQuestions();
			pageManage.getQAList();

			avalon.scan();

			me.defaultFirstTAB();
		});
	},

	/*
	 * 默认选择第一个TAB选项
	 */
	defaultFirstTAB: function() {
		var $subnav = $(".m-subnav-list").find("li");
		
		if ($subnav && $subnav.length) {
			$($subnav[0]).addClass("active");

			this.defaultFirstShopTab($subnav[0]);
		}
	},

	/*
	 * 店铺默认第一个tab选项
	 */
	defaultFirstShopTab: function(ele) {
		var $shopNav = $(ele).find('li');
		$($shopNav[0]).addClass("active");
	}
}

$(document).ready(function() {
	pageManage.init();
});