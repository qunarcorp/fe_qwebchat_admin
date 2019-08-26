/*
 * @author: 
 * @Date: 2016-05-10
 * @lastModify: 
 * @lastModifyDate: 2016-05-10
 * @description: 用于商户在线咨询管理平台 - 为客服分组添加产品
 * @other：依赖avalon，oniui，所有依赖在index中进行引入
 */

var config = {
	groupList: '/group/pageQueryGroupList.qunar', //查询分组列表
	assignPrds: '/group/assignProducts.qunar',
	getGroupPrds: '/group/queryProducts.qunar'
}

var prdGroupMapping = {
	init: function() {
		var self = this;

		this.mappingCache = {};
		this.initAvalon();

		avalon.nextTick(function() {
			self.getGroups();
		});
	},
	getGroups: function() {
		var self = this;

		var params = {
			busiId: 1,
			pageNum: 1,
			pageSize: 1000
		}

		avalon.ajax({
			url: config.groupList,
			type: 'get',
			dataType: 'json',
			data: params,
		}).done(function(resp) {
			if (resp && resp.ret) {
				var groupData = self.groupDataHandler(resp.data.groupList);
				self.initDefaultGroup(groupData);

				self.mappingModel.groups = groupData;

			} else {
				self.showAlert('获取分组失败');
			}
		}).fail(function(resp) {
			self.showAlert('获取分组失败');
		});
	},
	groupDataHandler: function(groupList) {
		var groupList = Array.isArray(groupList) ? groupList : [],
			result = {};

		for (var i = 0; i < groupList.length; i++) {
			result[groupList[i].id] = groupList[i].groupName;
		}

		return result;
	},
	getGroupPrds: function(groupId) {
		var self = this;
		groupId = groupId || '';

		if (!groupId) return;

		avalon.vmodels['mappingList'].showLoading();

		avalon.ajax({
			url: config.getGroupPrds,
			type: 'post',
			dataType: 'json',
			data: {
				groupId: groupId
			}
		}).done(function(resp) {
			if (resp && resp.ret) {
				self.updateList(resp.data);
			} else {
				self.updateList(false);
			}
		}).fail(function(resp) {
			self.updateList(false);
		}).always(function() {
			avalon.vmodels['mappingList'].hideLoading();
		});
	},
	assignPrds: function(groupId) {
		var self = this;

		if (!groupId) {
			this.showAlert('未指定分组');
			return;
		}

		prds = this.mappingCache[groupId];

		avalon.ajax({
			url: config.assignPrds,
			type: 'post',
			dataType: 'json',
			data: {
				groupId: groupId,
				pIds: prds.join(',')
			}
		}).done(function(resp) {
			if (resp && resp.ret) {
				self.mappingModel.clear();

				var latestData = [],
					latestData = self.mappingCache[groupId].map(function(i) {
						return {
							group: self.currentGroupName,
							prd: i
						}
					});

				avalon.vmodels['mappingList'].render(latestData);
				self.showAlert(resp.msg || '更新成功');
			} else {
				self.showAlert(resp.msg || '更新失败');
			}
		}).fail(function(resp) {
			self.showAlert(resp.msg || '更新失败');
		})
	},
	initAvalon: function() {
		var self = this;
		self.currentGroupName = '';

		var pattern = /^[\d|,|\s]+$/;

		var mapping = this.mappingModel = avalon.define('prdGroupMapping', function(vm) {
			vm.$skipArray = ['clear']
			vm.newPrds = '';
			vm.groups = {};

			vm.$mappingListOpt = {
				allChecked: false,
				loading: {
					type: "spin",
					modalBackground: "#000"
				},
				selectable: {
					type: 'Checkbox'
				},
				data: [],
				pageable: false,
				addRow: function(tmpl, columns, vm) {
					var tr = '<tr style="text-align:left"><td colspan="' + columns.length + '">&ensp;',
						checkbox = ""

					if (columns[0].key === "selected") {
						checkbox = "{{columns[0].name|html}}"
					}

					tr = tr + checkbox + '&ensp;&ensp;<a href="javascript:;" ms-click="prdDelete(true)">删除</a></td></tr>'
					return tr + tmpl;
				},
				htmlHelper: {
					del: function(vmId, key, index, val, row) {
						return '<a href="javascript:;" key="' + val + '" ms-click="prdDelete(false)">删除</a>';
					}
				},
				columns: [{
					key: 'group',
					name: '分组名称',
					width: 200
				}, {
					key: 'prd',
					name: '产品Id',
					width: 200
				}, {
					key: 'prd',
					name: '操作',
					width: 170,
					format: 'del'
				}]
			}

			vm.currentGroup = '';

			vm.changeGroup = function(e) {
				var groupId = this.getAttribute('key');

				self.currentGroupName = this.innerHTML;

				if (groupId == vm.currentGroup) {
					return
				}

				vm.currentGroup = groupId;
				self.getGroupPrds(groupId);
			}

			vm.prdSave = function(e) {
				var newPrds = vm.newPrds.trim(),
					groupId = vm.currentGroup;

				if (!newPrds) {
					self.showAlert('未输入产品Id')
					return;
				}

				if (pattern.test(newPrds) === false) {
					self.showAlert('只能输入数字和英文状态的逗号')
					return;
				}

				newPrds = newPrds.split(',');

				for (var i = 0; i < newPrds.length; i++) {
					if (self.mappingCache[groupId].indexOf(newPrds[i]) === -1) {
						self.mappingCache[groupId].push(newPrds[i]);
					}
				}

				self.assignPrds(groupId);
			}

			vm.prdDelete = function(isPatch) {
				var groupId = vm.currentGroup,
					ids = isPatch ? avalon.vmodels['mappingList'].getSelected().map(function(i) {
						return i.prd
					}) : [this.getAttribute('key')];

				for (var i = 0, position; i < ids.length; i++) {
					position = self.mappingCache[groupId].indexOf(ids[i]);
					self.mappingCache[groupId].splice(position, 1);
				}

				self.assignPrds(groupId);
			}

			vm.clear = function() {
				vm.newPrds = '';
			}
		});
	},
	initDefaultGroup: function(groupData) {
		var defaultGroup, groupId;

		for (var i in groupData) {
			if (groupData.hasOwnProperty(i)) {
				defaultGroup = defaultGroup || {
					key: i,
					text: groupData[i]
				}
			}
		}

		if (defaultGroup) {
			groupId = defaultGroup.key + '';
			this.currentGroupName = defaultGroup.text;

			this.mappingModel.currentGroup = groupId;
			this.mappingCache[groupId] = [];

			this.getGroupPrds(groupId);
		}
	},
	updateList: function(data) {
		var self = this;

		if (!data) {
			this.showAlert('数据更新失败');
			return
		}

		var data = Array.isArray(data) ? data.length ? data : [] : [],
			result = [],
			groupId = this.mappingModel.currentGroup;

		this.mappingCache[groupId] = [];

		for (var i = 0; i < data.length; i++) {
			result.push({
				group: self.currentGroupName,
				prd: data[i]
			});

			this.mappingCache[groupId].push(data[i]);
		}

		avalon.vmodels['mappingList'].render(result);
	},
	showAlert: function(content) {
		avalon.vmodels['GMManage'].showAlert(content);
	}
}

module.exports = prdGroupMapping;