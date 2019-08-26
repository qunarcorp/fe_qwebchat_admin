/*
 * @author: matt.liu
 * @Date: 2015-10-20
 * @lastModify: matt.liu
 * @lastModifyDate: 2015-10-20
 * @description: 用于商户在线咨询管理平台分组管理页面tab页面
 * @other：依赖avalon，oniui，所有依赖在index中进行引入
 */
var editGroupTpl = require('../template/editGroup.string'),
	rmGroupTmp = require('../template/rmGroup.string'),
	validationConfig = require('jsCommon/validationConfig.js'),
	config = {
		// sortMethod: '/sys/queryAllStrategyList.qunar', //查询排队策略
		groupList: '/group/pageQueryGroupList.qunar', //查询分组列表
		GMList: '/seat/pageQuerySeatList.qunar', //查询客服列表
		editGroup: '/group/saveOrUpdateGroup.qunar', //编辑分组
		rmGroup: '/group/deleteGroup.qunar' //删除分组
	},
	vm = avalon.vmodels;
var groupManage = {
	init: function() {
		// this.getSortMethods();
		vm.groupManage.getGroupList();
		avalon.scan();
	},

	initAvalon: function() {
		var GMManage = vm.GMManage,
			me = this;
		var groupList = avalon.define({
			$id: 'groupManage',
			$skipArray: ['groupList'],
			GMList: [],
			hasGMList: false,
			groupId: '',
			groupName: '',
			suIds: '',
			suIdList: [],
			rowSuList: window.suList,
			//编辑分组数据
			rowData: {},
			$groupList: {
				$skipArray: ['htmlHelper'],
				autoResize: false,
				htmlHelper: {
					seatHtml: function(vmId, field, index, cellValue, rowData) {
						var len = len = cellValue ? cellValue.length : 0,
							html = '';
						while (len--) {
							html += '<span  data-id="' + cellValue[len].seat_id + '" class="pd5">' + cellValue[len].qunarName + '</span>';
						}
						return html;
					},
					createTimehtml: function(vmId, field, index, cellValue, rowData) {
						if (cellValue) {
							var time = new Date(cellValue);
							return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
						}
						return '';
					},
					operateHtml: function(vmId, field, index, cellValue, rowData) {
						return '<a href="javascript:void(0)"  data-id="' + rowData.id + '" data-groupName="' + rowData.groupName + '" data-supplierId="' + rowData.supplierId + '" data-defaultValue="' + rowData.defaultValue + '"  ms-click="editGroupDialog" class="pd5" data-rel="' + index + '">编辑</a><a href="javascript:void(0)" data-groupId="' + rowData.id + '" ms-click="removeGroup" data-groupName="' + rowData.groupName + '" class="pd5">删除</a>';
					}
				},
				columns: [{
					key: "id",
					name: "组ID",
					sortable: false,
					isLock: true,
					align: "center",
					defaultValue: "数据错误",
					toggle: false,
					width: 120
				}, {
					key: "groupName",
					name: "组名称",
					sortable: false,
					width: 120
				}, {
					key: "supplierName",
					name: "所属商家",
					sortable: false,
					width: 200
				}, {
					key: "createTime",
					name: "添加日期",
					sortable: false,
					width: 120,
					format: 'createTimehtml'
				}, {
					key: "seatList",
					name: "包含客服",
					sortable: false,
					width: 200,
					format: 'seatHtml'
				}, 
				// {
				// 	key: "strategyName",
				// 	name: "排队策略",
				// 	sortable: false,
				// 	width: 120
				// }, 
				{
					name: "操作",
					sortable: false,
					width: 100,
					format: 'operateHtml'
				}],
				data: [],
				pager: {
					perPages: 15,
					totalItems: 100,
					showPages: 5,
					onJump: function(e, page) {
						avalon.vmodels.groupManage.groupData.pageNum = page.currentPage;
						avalon.vmodels.groupManage.getGroupList();
					}
				}
			},
			//查询列表参数
			groupData: {
				groupName: '',
				// strategyId: '',
				pageSize: 15,
				pageNum: 1,
				suIds: ''
			},
			//编辑分组弹窗
			$groupEdit: {
				title: '编辑分组',
				content: '',
				width: 'auto',
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
			//删除分组
			$rmGroup: {
				title: '删除分组',
				content: rmGroupTmp,
				width: 'auto',
				onConfirm: function() {
					avalon.ajax({
							url: config.rmGroup,
							type: 'POST',
							data: {
								"groupId": vm.groupManage.groupId
							},
							dataType: 'json'
						})
						.done(function(result) {
							if (result.ret) {
								vm.GMManage.showAlert('删除分组成功！');
								me.clearSearchInfo();
								vm.groupManage.getGroupList();
							} else {
								vm.GMManage.error(result);
							}
						})
						.fail(GMManage.error)
				}
			},
			//获取分组列表
			getGroupList: function() {
				avalon.ajax({
						url: config.groupList,
						type: 'GET',
						data: vm.groupManage.groupData.$model,
						dataType: 'json'
					})
					.done(function(result) {
						if (result.ret) {
							var $groupsList = vm.$groupList,
								data = result.data ? result.data.groupList : [];
							$groupsList.render(data);
							$groupsList.pager.totalItems = result.data.totalCount;
						} else {
							GMManage.error(result);
						}
					})
					.fail(avalon.vmodels.GMManage.error);
			},
			//编辑、添加分组
			editGroupDialog: function() {
				var me = groupManage,
					thisVm = vm.groupManage,
					info = this.getAttribute('data-rel') ? vm.$groupList.data[Number(this.getAttribute('data-rel'))] : {},
					
					thisSuId = Number(this.getAttribute('data-supplierId'));
					rowSuList = avalon.mix([], thisVm.rowSuList);
				thisVm.title = this.getAttribute('data-rel') ? '编辑分组' : '添加分组';
				thisVm.GMInfo = avalon.mix(true, {}, info);
				// //策略信息没有的时候不显示弹窗
				// if (!GMManage.sortMethods.$model.length) {
				// 	return;
				// }
				avalon.each(rowSuList, function(i, item){
					if (item.id === thisSuId) {
						item.isChecked = 1;
					} else {
						item.isChecked = 0;
					}
				});
				thisVm.suIds = thisSuId;
				me.initEditAvalon();
				vm.editGroup.datas.groupName = this.getAttribute('data-groupName') || '';
				vm.editGroup.datas.id = this.getAttribute('data-id') || '';
				vm.editGroup.datas.defaultValue = this.getAttribute('data-defaultValue')?parseInt(this.getAttribute('data-defaultValue')): 0;
				me.getGMList(thisSuId);
			},
			mixEditData: function(rowData, GMList, business) {
				var	seatList = [];
				// strategy = strategy || avalon.mix([], GMManage.sortMethods.$model);
				avalon.each(GMList, function(i, item) {
					item.isChecked = 0;
				})
				avalon.each(rowData.seatList, function(i, item) {
					avalon.each(GMList, function(k, subItem) {
						if (item.id === subItem.id) {
							subItem.isChecked = 1;
							subItem.hasSet = true;
							seatList.push({
								id: subItem.id
							});
						} else {
							if (!subItem.hasSet) {
								subItem.isChecked = 0;
							}
						}
					})
				})
				// avalon.each(strategy, function(i, item) {
				// 	if (item.name == rowData.strategyName) {
				// 		item.isChecked = 1;
				// 	} else {
				// 		item.isChecked = 0;
				// 	}
				// })
				// vm.editGroup.datas.strategyId = rowData.strategyId || '';
				vm.editGroup.datas.seatList = seatList.length ? JSON.stringify(seatList) : '';
				return {
					// strategy: strategy,
					seatList: GMList
				}
			},
			//改变所属商家
			changeSuId: function() {
				var suId = Number(this.getAttribute('data-id')),
					isChecked = Number(this.getAttribute('data-isChecked'));
					rowSuList = avalon.mix([], vm.groupManage.rowSuList.$model);
				avalon.each(rowSuList, function(i, item){
					if (item.id === suId) {
						if (!isChecked) {
							item.isChecked = 1;
							vm.groupManage.suIds = suId;
							me.getGMList(suId);
						} else {
							item.isChecked = 0;
							vm.groupManage.suIds = '';
							vm.groupManage.rowData.seatList = [];
						}
					} else {
						item.isChecked = 0;
					}
				})
				vm.groupManage.rowSuList = avalon.mix([], rowSuList);

			},
			//改变策略
			// changeStrategy: function() {
			// 	var strategyId = this.getAttribute('data-id'),
			// 		preStrategyId = vm.editGroup.datas.strategyId;
			// 	rowData = vm.groupManage.rowData,
			// 	strategyIuput = document.getElementById('strategy');
			// 	avalon.each(rowData.strategy, function(i, item) {
			// 		if (item.id == strategyId) {
			// 			if (item.isChecked === 0) {
			// 				item.isChecked = 1;
			// 			} else {
			// 				item.isChecked = 0;
			// 				strategyId = '';
			// 			}
			// 		} else {
			// 			item.isChecked = 0;
			// 		}
			// 	})
			// 	vm.editGroup.datas.strategyId = strategyId;
			// 	if (!preStrategyId && vm.editGroup.datas.strategyId) {
			// 		validationConfig.removeError(strategyIuput);
			// 	} else if (!vm.editGroup.datas.strategyId){
			// 		validationConfig.showError(strategyIuput, '');
			// 	}
			// },
			changeGMChecked: function() {
				var GMId = this.getAttribute('data-id'),
					rowData = vm.groupManage.rowData,
					seatList = vm.editGroup.datas.seatList === '' ? [] : avalon.parseJSON(vm.editGroup.datas.seatList) || [],
					preSeat = avalon.mix([], seatList),
					seatInput = document.getElementById('groupSeat'),
					seatListLen = seatList.length;
				avalon.each(rowData.seatList, function(i, item) {
					if (item.id == GMId) {
						if (item.isChecked) {
							item.isChecked = 0;
							if (seatListLen) {
								while (seatListLen--) {
									if (seatList[seatListLen].id == GMId) {
										seatList.splice(seatListLen, 1);
									}
								}
							}
						} else {
							item.isChecked = 1;
							seatList.push({
								id: GMId
							});
						}
					}
				})
				vm.editGroup.datas.seatList = seatList.length ? JSON.stringify(seatList) : '';
				if (!preSeat.length && vm.editGroup.datas.seatList) {
					validationConfig.removeError(seatInput);
				} else if (!vm.editGroup.datas.seatList){
					validationConfig.showError(seatInput, '');
				}
			},
			//删除分组
			removeGroup: function() {
				var groupId = this.getAttribute('data-groupId'),
					groupName = this.getAttribute('data-groupName');
				vm.groupManage.groupName = groupName;
				vm.groupManage.groupId = groupId;
				GMManage.showDialog('$rmGroup');
			}
		});
	},
	initEditAvalon: function() {
		var me = this;
		var editGroup = avalon.define({
			$id: 'editGroup',
			$skipArray: ['validation'],
			datas: {
				id: '',
				groupName: '',
				busiList: [{
					id: window.bType
				}],
				// strategyId: '',
				seatList: '',
				suIdList: [],
                defaultValue: 0,
			},
			$Groupvalidation: avalon.mix(validationConfig, {
				onValidateAll: function(reasons) {
					reasons.forEach(function(reason) {
						avalon(reason.element).removeClass("success").addClass("error")
						validationConfig.showError(reason.element, reason)
					})
					if (reasons.length === 0) {
						me.confirmGroupEdit();
					}
				}
			})
		})
		avalon.scan();
	},
	//清空搜索条件
	clearSearchInfo: function() {
		vm.groupManage.groupData.groupName = '';
		// vm.groupManage.groupData.strategy = '';
		vm.groupManage.groupData.busi_id = '';
	},
	// getSortMethods: function() {
	// 	avalon.ajax({
	// 			url: config.sortMethod,
	// 			type: 'GET',
	// 			dataType: 'json'
	// 		})
	// 		.done(function(result) {
	// 			avalon.vmodels['GMManage']['sortMethods'] = result.data;
	// 		})
	// 		.fail(avalon.vmodels.GMManage.error);
	// },
	//获取当前供应商的客服列表
	getGMList: function(suId, rowData, title) {
		var me = this;
		var GMManage = vm.GMManage;
		var thisVm = vm.groupManage;
		avalon.ajax({
			url: config.GMList,
			type: 'GET',
			data: {
				suIds: suId,
				pageSize: 200
			},
			dataType: 'json'
		}).done(function(result) {
			var GMList = [];
			if (!result.data) {
				vm.GMManage.showAlert('请先为该商家添加客服！');
				thisVm.rowData.seatList = [];
				return;
			}
			avalon.each(result.data.seatList, function(i, item) {
				GMList.push({
					id: item.id,
					qunarName: item.webName
				})
			})
			thisVm.GMList = GMList;
			thisVm.hasGMList = true;
			thisVm.rowData = avalon.mix({}, thisVm.mixEditData(thisVm.GMInfo, avalon.mix([], thisVm.GMList.$model)));
			GMManage.showDialog('$groupEdit', thisVm.title, editGroupTpl);
			me.validateObj = vm.$Groupvalidation;
			if (!GMManage.hasRenderChecked) {
				GMManage.renderChecked();
			}
			avalon.scan();
		}).fail(GMManage.error)
	},
	//删除编辑分组相关的vm
	deleteEditVm: function() {
		vm.$groupEdit.setContent('');
		delete vm.editGroup;
		delete vm.$Groupvalidation;
	},
	//新增、编辑分组
	confirmGroupEdit: function() {
		var me = this,
			params = avalon.mix({}, vm.editGroup.datas.$model);
		params.seatList = avalon.parseJSON(params.seatList);
		params.suIdList.push(vm.groupManage.suIds);
        params.defaultValue = params.defaultValue?1:0;
		avalon.ajax({
				url: config.editGroup,
				type: 'POST',
				data: {
					"p": JSON.stringify(params)
				},
				dataType: 'json'
			})
			.done(function(result) {
				if (result.ret) {
					me.clearSearchInfo();
					vm.groupManage.getGroupList();
					vm.$groupEdit._close();
				} else {
					vm.$groupEdit._close();
				}
				vm.GMManage.showAlert(result.msg);
			})
			.fail(function() {
				vm.$groupEdit._close();
				vm.GMManage.showAlert(vm.$groupEdit.title + '失败，请稍后再试');
			})
	}
};
module.exports = groupManage;