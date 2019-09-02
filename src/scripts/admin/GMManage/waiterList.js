/*
 * @author: matt.liu
 * @Date: 2015-10-18
 * @lastModify: matt.liu
 * @lastModifyDate: 2015-10-20
 * @description: 用于商户在线咨询管理平台客服管理页面客服列表tab页面
 * @other：依赖avalon，oniui，所有依赖在index中进行引入
 */
var editGMTpl = require('../template/editGM.string'),
	rmGM = require('../template/rmGM.string'),
	validationConfig = require('jsCommon/validationConfig.js'),
	sortSeat = require('../template/sortSeat.string'),
	config = {
		GMList: '/seat/pageQuerySeatList.qunar', //查询客服列表
		editGM: '/seat/saveOrUpdateSeat.qunar', //添加、编辑客服
		rmGM: '/seat/deleteSeat.qunar', //删除客服
		businessGroup: '/group/queryBusiGroup.qunar', //业务分组对应关系
		updatePriority: '/seat/sortSeat.qunar', //更新客服优先级
		getUserName: '/seat/checkLoginName.qunar', //根据手机号，邮箱，用户名进行判断是否存在用户
		getSuList: '/seat/getSuListByQName.qunar' //获取客服所属的供应商
	},
	vm = avalon.vmodels;
var currentLoginUserName = ($.cookie('_q') || '').slice(2);
var wechat = require('./bindWechat');
var WaiterList = {
	init: function () {
		this.initAvalon();
		this.addValidationRule();
	},

	initAvalon: function () {
		var me = this,
			GMManage = vm.GMManage;
		var waiterList = avalon.define({
			$id: 'waiterList',
			$skipArray: ['$editGM', '$rmGM', '$waiterList'],
			startX: '',
			startY: '',
			amIWaiter: false,
			hasBoundWechat: false, // 该账号是否绑定了微信公众号
			//当前删除的信息
			qunarName: '',
			//是否为添加操作
			isAdd: true,
			rowSuList: [],
			sowSuListLen: 0,
			userName: '',
			qunarId: '',
			//搜索条件
			GMdata: {
				qunarName: '',
				webName: '',
				busiType: '',
				pageSize: 15,
				pageNum: 1,
				bySort: '',
				suIds: []
			},
			suIdList: [],
			groupList: [],
			suIds: '',
			closeDialog: false,
			//判断是否有分组
			hasBusinessGroup: false,
			//编辑客服 
			rowData: [],
			//业务分组对应数据
			businessGroup: [],
			$waiterList: {
				autoResize: false,
				htmlHelper: {
					groupHtml: function (vmId, field, index, cellValue, rowData) {
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
					businessHtml: function (vmId, field, index, cellValue, rowData) {
						var len = cellValue ? cellValue.length : 0,
							html = '';
						if (!cellValue) {
							return '';
						}
						while (len--) {
							html += '<span  class="pd5">' + cellValue[len]['busiName'] + '</span>';
						}
						return html;
					},
					createTimehtml: function (vmId, field, index, cellValue, rowData) {
						if (cellValue) {
							var time = new Date(cellValue);
							return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
						}
						return '';
					},
					operateHtml: function (vmId, field, index, cellValue, rowData) {
						var business = rowData.busiList,
							busiList = [];
						avalon.each(business, function (i, item) {
							busiList.push({
								id: item.busiId
							})
						});
						busiList = JSON.stringify(busiList);
						return '<a href="javascript:void(0)" data-qunarName="' + rowData.qunarName + '"data-webName="' + rowData.webName + '" data-id="' + rowData.id + '" data-busiList="' + busiList + '" data-supplierId="' + rowData.supplierId + '" data-maxSessions="' + rowData.maxSessions + '" data-rel="' + index + '" ms-click="editWiter" class="pd5">编辑</a><a href="javascript:void(0)" data-id="' + rowData.id + '" ms-click="removeGM" data-qunarName="' + rowData.qunarName + '" class="pd5">删除</a>';
					},
					bindwxHtml: function (vmId, field, index, cellValue, rowData) {
						if (currentLoginUserName === rowData.qunarName) {
							waiterList.amIWaiter = true;

							if (rowData.bindWx) {
								waiterList.hasBoundWechat = true;
							}
						}
						return rowData.bindWx ? '已绑定' : '未绑定';
					}
				},
				columns: [{
					key: "qunarName", //列标识
					name: "用户名", //列名
					sortable: false, //是否可排序
					isLock: true, //是否锁死列让其始终显示
					align: "center", //列的对象方式
					defaultValue: "数据错误", //列的默认值
					toggle: true, //控制列的显示隐藏
					width: 130
				}, {
					key: "webName",
					name: "网络显示名",
					sortable: false,
					width: 150
				}, {
					key: "busiList",
					name: "组",
					sortable: false,
					width: 180,
					format: 'groupHtml'
				}, {
					key: "supplierName",
					name: "所属商家",
					sortable: false,
					width: 160
				}, {
					key: 'bindWx',
					name: '绑定微信状态',
					width: 100,
					format: 'bindwxHtml'
				}, 
				// {
				// 	key: 'host',
				// 	name: '域名',
				// 	width: 120
				// }, 
				{
					key: "createTime",
					name: "添加日期",
					sortable: false,
					width: 180,
					format: 'createTimehtml'
				}, {
					name: "操作",
					sortable: false,
					width: 140,
					format: 'operateHtml'
				}],
				//host
				data: [],
				pager: {
					perPages: 15,
					totalItems: 100,
					showPages: 5,
					onJump: function (e, page) {
						vm.waiterList.GMdata.pageNum = page.currentPage;
						vm.waiterList.getGMList();
					}
				}
			},
			//编辑客服弹窗
			$editGM: {
				title: '',
				content: '',
				width: 450,
				onConfirm: function () {
					me.validateObj.validateAll();
					return false;
				},
				onCancel: function () {
					me.deleteEditVm();
				},
				onClose: function () {
					me.deleteEditVm();
				}
			},
			//调整优先级
			$editPriority: {
				title: '调整显示顺序(<span class="red">鼠标拖拽需要调整的客服</span>)',
				content: sortSeat,
				width: 600
			},
			//删除客服
			$rmGM: {
				title: '删除客服',
				content: rmGM,
				width: 360,
				onConfirm: function () {
					avalon.ajax({
							url: config.rmGM,
							type: 'POST',
							data: {
								"seatId": vm.waiterList.qunarId
							},
							dataType: 'json'
						})
						.done(function (result) {
							if (result.ret) {
								vm.waiterList.getGMList();
							}
							vm.GMManage.error(result);
						})
						.fail(GMManage.error)
				}
			},
			//获取客服列表
			getGMList: function () {
				WaiterList.getWaiterList()
					.done(function (result) {
						if (result.ret) {
							var $waiterList = vm.$waiterList,
								data = result.data ? result.data.seatList : [];
							$waiterList.render(data);
							$waiterList.pager.totalItems = result.data.totalCount;
						} else {
							GMManage.error(result);
						}
					})
					.fail(GMManage.error);
			},
			//渲染优先级
			renderSortSeat: function () {
				var suIds = vm.waiterList.GMdata.suIds;
				if (!suIds.length) {
					vm.GMManage.showAlert('请先选择所属商家再进行操作！');
					return;
				}
				if (suIds.length > 1) {
					vm.GMManage.showAlert('只可选择一个所属商家！');
					return;
				}
				vm.waiterList.GMdata.bySort = "priority";
				WaiterList.getWaiterList()
					.done(function (result) {
						if (!result.ret || !result.data || !result.data.seatList) {
							return;
						}
						if (vm.priority) {
							vm.priority.data = result.data.seatList;
						} else {
							WaiterList.initSortAvalon(result.data.seatList);
						}
						vm.waiterList.GMdata.bySort = "";
						//高度设定之后再进行弹窗
						setTimeout(function () {
							GMManage.showDialog('$editPriority');

						}, 0)
					})
					.fail(function (result) {
						GMManage.error(result);
						vm.waiterList.GMdata.bySort = "";
					})
			},

			//修改客服所属商家
			changeSuClassify: function (e) {
				var suIds = vm.waiterList.GMdata.suIds;
				var thisLi = this.parentElement,
					oLi = thisLi.parentElement.getElementsByTagName('li'),
					rel = this.getAttribute('data-rel'),
					suId = this.getAttribute('data-id'),
					len = suIds.length,
					_index;
				if (rel === 'all') {
					var len = oLi.length;
					while (len--) {
						avalon(oLi[len]).removeClass('active');
					}
					avalon(thisLi).addClass('active');
					vm.waiterList.GMdata.suIds = [];
				} else {
					avalon(oLi[0]).removeClass('active');
					if (avalon(thisLi).hasClass('active')) {
						while (len--) {
							if (suIds[len] == suId) {
								_index = len;
							}
						}
						suIds.splice(_index, 1);
						avalon(thisLi).removeClass('active');
					} else {
						avalon(thisLi).addClass('active');
						suIds.push(suId);
					}
				}


			},

			//编辑、添加客服
			editWiter: function () {
				var thisVm = vm.waiterList,
					info = this.getAttribute('data-rel') ? vm.$waiterList.data[Number(this.getAttribute('data-rel'))] : [],
					// rowData = avalon.mix(true, [], info.busiList),
					rowData = [],
					thisSuid = this.getAttribute('data-supplierId'),
					me = WaiterList,
					title = this.getAttribute('data-rel') ? '编辑客服' : '添加客服',
					qName = this.getAttribute('data-qunarName');
				thisVm.isAdd = this.getAttribute('data-rel') ? false : true;
				me.initEditAvalon();
				vm.editGM.datas.id = this.getAttribute('data-id') || '';
				vm.editGM.datas.qunarName = this.getAttribute('data-qunarName') || '';
				vm.editGM.datas.webName = this.getAttribute('data-webName') || '';
				vm.editGM.datas.maxSessions = this.getAttribute('data-maxSessions') || '10';
				vm.editGM.datas.serviceMode = true;
				//vm.editGM.datas.busiList = this.getAttribute('data-busiList');
				if (thisVm.isAdd) {
					thisVm.mixSuListData(rowData, avalon.mix([], window.suList), thisSuid);
					GMManage.showDialog('$editGM', title, editGMTpl);
					me.validateObj = vm.$editGMDlg;
					me.editObj = vm.editGM;
					if (!GMManage.hasRenderChecked) {
						GMManage.renderChecked();
					}
					return;
				}
				thisVm.groupListInfo(info.busiList);
				me.getSuList(qName).done(function (result) {
					if (!result.ret) {
						vm.GMManage.showAlert(result.msg);
						return;
					}
					if (result.data || result.data.length) {
						rowData = avalon.mix([], result.data);
					}
					thisVm.sowSuListLen = result.data.length;
					thisVm.mixSuListData(rowData, avalon.mix([], window.suList), thisSuid);
					GMManage.showDialog('$editGM', title, editGMTpl);
					me.validateObj = vm.$editGMDlg;
					me.editObj = vm.editGM;
					if (!GMManage.hasRenderChecked) {
						GMManage.renderChecked();
					}
				}).fail(vm.GMManage.error);
			},
			bindWechat: function () {
				wechat.bindAccount();
			},
			unbindWechat: function () {
				wechat.unbind(function successFn() {
					waiterList.getGMList();
					waiterList.hasBoundWechat = false;
				});
			},
			//删除客服
			removeGM: function () {
				var id = this.getAttribute('data-id'),
					qunarName = this.getAttribute('data-qunarName');
				vm.waiterList.qunarName = qunarName;
				vm.waiterList.qunarId = id;
				GMManage.showDialog('$rmgm');
			},
			//混合当前客服所在分组和总分组的数据
			mixSuListData: function (rowData, rowSuList, thisSuid) {
				var _index,
					suListArr = [],
					suIdList = [];
				avalon.each(rowData, function (i, item) {
					suIdList.push(item.id);
					if (item.id == thisSuid) {
						_index = i;
					}
				})
				rowData.splice(_index, 1);
				avalon.each(rowSuList, function (i, item) {
					var hasId = false;
					avalon.each(rowData, function (i, subItem) {
						if (subItem.id === item.id) {
							hasId = true;
						}
					})
					if (!hasId) {
						if (item.id != thisSuid) {
							item.isChecked = 0;
							suListArr.push(item);
						} else if (item.id == thisSuid) {
							item.isChecked = 1;
							suListArr.push(item);
						}
					}

				})
				vm.waiterList.suIdList = avalon.mix([], suIdList);
				vm.waiterList.suIds = suIdList.join('');
				vm.waiterList.rowSuList = avalon.mix([], suListArr);
			},
			//改变所属商家
			changeSupplier: function () {
				var suId = this.getAttribute('data-id'),
					isChecked = this.getAttribute('data-ischecked'),
					suIdList = avalon.mix([], vm.waiterList.suIdList),
					rowSuList = avalon.mix([], vm.waiterList.rowSuList),
					nowSuId,
					nextSuId,
					_index;
				if (vm.waiterList.isAdd) {
					avalon.each(rowSuList, function (i, item) {
						if (item.id == suId) {
							if (isChecked == 1) {
								item.isChecked = 0;
							} else {
								item.isChecked = 1;
								suIdList.push(suId);
							}
						}
					});
				} else {
					avalon.each(rowSuList, function (i, item) {
						if (item.id === 1) {
							nowSuId = item.id;
						}
						if (item.id == suId) {
							if (isChecked == 1) {
								item.isChecked = 0;
							} else {
								item.isChecked = 1;
								nextSuId = suId;
							}
						} else {
							item.isChecked = 0;
						}
					})
					avalon.each(suIdList, function (i, item) {
						if (item.id == nowSuId) {
							_index = i;
						}
					})
					if (typeof _index !== 'undefined') {
						suIdList.splice(_index, 1);
					}
					if (typeof nextSuId !== 'undefined') {
						suIdList.push(Number(nextSuId));
					}
				}

				vm.waiterList.suIdList = avalon.mix([], suIdList);
				vm.waiterList.suIds = suIdList.join(',');
			},
			groupListInfo: function (busiList) {
				var gr = [];
				//只会有一种业务线情况
				if(busiList&&busiList.length&&busiList.length>=1){
					gr = busiList[0].groupList?busiList[0].groupList:[];
				}
				gr = gr.map(function (v) {
					return {
						id:v.id,
						name:v.name
					}
				});
				vm.waiterList.groupList = avalon.mix([], gr);
				gr = null;
			},
			//改变分组选中状态
			changeGroupChecked: function () {
				var groupId = this.getAttribute('data-groupId'),
					busiId = this.parentElement.getAttribute('data-busiId'),
					rowData = vm.waiterList.rowData,
					group = vm.editGM.datas.groupList === '' ? [] : avalon.parseJSON(vm.editGM.datas.groupList),
					groupLen = group.length;
				avalon.each(rowData, function (i, item) {
					if (item.busiId == busiId) {
						avalon.each(item.groupList, function (k, subItem) {
							if (subItem.id == groupId) {
								if (subItem.isChecked) {
									subItem.isChecked = 0;
									if (groupLen > 0) {
										while (groupLen--) {
											if (group[groupLen].id == groupId) {
												group.splice(groupLen, 1);
											}
										}
									}
								} else {
									subItem.isChecked = 1;
									group.push({
										id: groupId
									});
								}
							}
						})
					}
				})
				vm.editGM.datas.groupList = group.length ? JSON.stringify(group) : '';
			}
		});
		avalon.nextTick(function () {
			avalon.scan();
			vm.waiterList.getGMList();
		});

		wechat.init(waiterList);
	},

	initEditAvalon: function () {
		var me = this;
		//编辑客服
		var editGM = avalon.define({
			$id: 'editGM',
			$skipArray: ['validation'],
			datas: {
				id: '',
				qunarName: '',
				webName: '',
				busiList: [{
					id: window.bType
				}],
				suIdList: [],
				groupList: [],
				maxSessions: '10',
				serviceMode: true
			},
			$editGMDlg: avalon.mix(validationConfig, {
				onValidateAll: function (reasons) {
					reasons.forEach(function (reason) {
						avalon(reason.element).removeClass("success").addClass("error")
						validationConfig.showError(reason.element, reason)
					})
					if (reasons.length === 0) {
						me.confirmEdit();
					}
				}
			})
		});
		avalon.scan();
	},
	//增加验证规则
	addValidationRule: function () {
		validationConfig.addRule('username', {
			message: '{{errerInfo}}',
			get: function (value, data, next) {
				if (!value) {
					next(value === '');
					return value;
				}
				avalon.ajax({
						url: config.getUserName,
						type: 'POST',
						data: {
							p: value
						},
						dataType: 'json'
					})
					.done(function (result) {
						if (result.code === '100000') {
							if (value !== result.data.userName) {
								// var hasSuccess = data.element.getAttribute('data-success');
								// data.data.errerInfo = ;
								data.element.setAttribute('data-successInfo', '<em style="color:#339900">客服关联用户名为:' + result.data.userName + '</em>');
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
					.fail(function (result) {
						next(result.userName === '');
						data.data.errerInfo = '无法添加客服，请稍后再试';
					})
				return value;
			}
		})
	},

	initSortAvalon: function (data) {
		var sortSeat = avalon.define({
			$id: 'priority',
			data: data,
			hasTr: false,
			setTr: '',
			curSeatId: '',
			preSeatId: '',
			nextSeatId: '',
			startX: '',
			startY: '',
			//调整优先级
			updateSortSeat: function () {
				if (!vm.priority.curSeatId) {
					return;
				}
				WaiterList.changePriority.call(this);
			},
			//点击设置当前位置
			setPosition: function (e) {
				WaiterList.changePriority.call(this);
			},
			setOverStyle: function (e) {
				if (vm.priority.hasTr) {
					this.style['border-top'] = '2px dotted #01bcd4';
				}
			},
			setOutStyle: function (e) {
				var sortSeat = vm.priority;
				this.style['border-top'] = '0';
			},
			setTrOutStyle: function () {
				var sortSeat = vm.priority;
				sortSeat.setTr.style.border = "none";
				sortSeat.setTr.style.background = "#fff";
				sortSeat.hasTr = false;
			}

		})
		avalon.nextTick(function () {
			avalon.scan();
		})
	},
	changePriority: function () {
		var seatId = this.getAttribute('data-id'),
			sortSeat = vm.priority;
		if (sortSeat.curSeatId == seatId) {
			sortSeat.setTr.style.border = "none";
			sortSeat.setTr.style.background = "#fff";
			sortSeat.hasTr = false;
			sortSeat.curSeatId = '';
			return;
		}
		if (!sortSeat.hasTr) {
			this.style.border = "1px solid #80dde9";
			this.style.background = "#f2f9fd";
			sortSeat.setTr = this;
			sortSeat.hasTr = true;
			sortSeat.curSeatId = seatId;
			return;
		}
		sortSeat.nextSeatId = seatId;
		var data = avalon.mix([], sortSeat.data.$model),
			len = data.length,
			curLen = len - 1,
			curSeatInfo;
		while (len--) {
			if (data[len].id == sortSeat.curSeatId) {
				curSeatInfo = data[len];
				data.splice(len, 1);
			}
		}
		if (sortSeat.nextSeatId === null) {
			//插入末尾
			data.push(curSeatInfo);
		} else {
			while (curLen--) {
				if (data[curLen].id == sortSeat.nextSeatId) {
					if (curLen === 0) {
						sortSeat.preSeatId = 0;
						data.unshift(curSeatInfo);
						break;
					} else {
						sortSeat.preSeatId = data[curLen - 1].id;
						data.splice(curLen, 0, curSeatInfo);
					}
				}
			}
		}
		sortSeat.setTr.style.border = "none";
		sortSeat.setTr.style.background = "#fff";
		sortSeat.hasTr = false;
		//sortSeat.curSeatId = '';
		sortSeat.data = avalon.mix([], data);
		WaiterList.updatePriority();
	},
	updatePriority: function () {
		avalon.ajax({
				url: config.updatePriority,
				type: 'POST',
				data: {
					supplierId: vm.waiterList.GMdata.suIds[0],
					curSeatId: vm.priority.curSeatId,
					preSeatId: vm.priority.preSeatId
				},
				dataType: 'json'
			})
			.done(function () {
				//vm.waiterList.renderSortSeat();
			})
			.fail(function (e) {
				vm.GMManage.showAlert('服务器错误，请稍后再修改显示顺序')
				vm.waiterList.renderSortSeat();
			})
	},
	//请求客服列表
	getWaiterList: function () {
		var params = avalon.mix({}, vm.waiterList.GMdata.$model);
		params.suIds = params.suIds.join(',');
		return avalon.ajax({
			url: config.GMList,
			type: 'GET',
			data: params,
			dataType: 'json'
		})
	},
	//获取该客服所在分组
	getSuList: function (qName) {
		return avalon.ajax({
			url: config.getSuList,
			type: 'GET',
			data: {
				qName: qName
			},
			dataType: 'json'
		})
	},

	clearSearchInfo: function () {
		vm.waiterList.GMdata.qunarName = '';
		vm.waiterList.GMdata.webName = '';
		vm.waiterList.GMdata.busiType = '';
	},

	//删除编辑相关vm
	deleteEditVm: function () {
		vm.$editGM.setContent('');
		delete vm.editGM;
		delete vm.$editGMDlg;
	},

	//添加编辑客服之后的回调
	confirmEdit: function (operate) {
		var me = this,
			params = avalon.mix({}, vm.editGM.datas.$model);
		params.qunarName = vm.waiterList.userName || params.qunarName;
		params.suIdList = avalon.mix([], vm.waiterList.suIdList.$model);
		params.groupList = avalon.mix([], vm.waiterList.groupList.$model);
		avalon.ajax({
				url: config.editGM,
				type: 'POST',
				data: {
					"p": JSON.stringify(params)
				},
				dataType: 'json'
			})
			.done(function (result) {
				if (result.ret) {
					me.clearSearchInfo();
					vm.waiterList.getGMList();
					//触发onClose
					vm.$editGM._close();
				} else {
					vm.$editGM._close();
				}
				vm.GMManage.error(result);
			})
			.fail(function () {
				// //多个弹窗共用一个遮罩层，需改变zindex
				vm.$editGM._close();
				vm.GMManage.showAlert(vm.$editGM.title + '失败，请稍后再试')
			})
	}
}
module.exports = WaiterList;