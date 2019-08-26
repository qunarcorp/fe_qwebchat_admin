require('avalonUI/datepicker/avalon.datepicker');

var config = {
      feedbackList: '/sys/feedback.qunar',
      updateFeedback: '/sys/update_feedback.qunar',
      ignoreFeedback: '/sys/ignore_feedback.qunar',
      getUser: '/dashboard/getUser.qunar'
    },
    vm = avalon.vmodels;

var FeedbackList = {
  init: function() {
    this.initAvalon();
    
    this.getUser().then(function(result) {
      if (result.ret) {
        vm.feedbackList.username = result.data.username;
      }
    });
  },

  initAvalon: function() {
    var feedbackList = avalon.define({
      $id: 'feedbackList',
      username: '',
      //搜索条件
      PMdata: {
        start_time: '',
        end_time: '',
        is_worked: '',
        intent_type: '',
        status: '',
        limit: 20,
        offset: 0
      },
      //用户反馈列表
      $feedbackList: {
        autoResize: false,
        data:  [],
        htmlHelper: {
          sortHtml: function(vmId, field, index, cellValue, rowData) {
            return index + vm.feedbackList.PMdata.offset;
          },
          intentTypeHtml: function(vmId, field, index, cellValue, rowData) {
            var result;
            switch (cellValue){
                case 0: 
                    result = '闲聊';
                    break;
                case 1:
                    result = '业务';
                    break;
                default:
                    result = '';
            }
            return result;
          }, 
          isWorkedHtml: function(vmId, field, index, cellValue, rowData) {
            return result = cellValue == 0 ? '否' : cellValue == 1 ? '是' : '';
          },
          statusHtml: function(vmId, field, index, cellValue, rowData) {
            var result;
            switch (cellValue){
                case 0: 
                    result = '未处理';
                    break;
                case 1:
                    result = '已处理';
                    break;
                default:
                    result = '';
            }
            return result;
          },
          operateHtml: function(vmId, field, index, cellValue, rowData) {
            if (rowData.status === 0) {
              return '<a href="javascript:;" data-id="'+ rowData.id +'" data-question="'+ rowData.question +'" data-answer="'+ rowData.answer +'" data-intent_type="'+ rowData.intent_type +'" ms-click="editFeedbackQuestion">编辑</a>' + ' ' +
                   '<a href="javascript:;" data-id="'+ rowData.id +'" data-question="'+ rowData.question +'" ms-click="handleIgnoreFeedback">忽略</a>';
            } else {
              return '<a href="javascript:;" data-id="'+ rowData.id +'" data-question="'+ rowData.question +'" data-answer="'+ rowData.answer +'" data-intent_type="'+ rowData.intent_type +'" ms-click="editFeedbackQuestion">编辑</a>';
            }
          }
        },
        columns: [{
          name: '序列',
          sortable: false,
          width: 50,
          format: 'sortHtml'
        },{
          key: 'question', // 列标识
          name: '用户问题', // 列名
          sortable: false, // 是否可排序
          isLock: true, // 是否锁死列让其始终显示
          align: 'center', // 列的对象方式
          defaultValue: '', // 列的默认值
          width: 180
        }, {
            key: 'answer',
            name: '匹配答案',
            sortable: false,
            width: 190
        }, {
            key: 'origin_question',
            name: '原问题',
            sortable: false,
            width: 200,
        }, {
            key: 'update_time',
            name: '问题时间',
            sortable: false,
            width: 120,
        }, {
            key: 'intent_type',
            name: '问题类型',
            sortable: false,
            width: 100,
            format: 'intentTypeHtml'
        },{
            key: 'is_worked',
            name: '用户反馈',
            sortable: false,
            width: 100,
            format: 'isWorkedHtml'
        }, {
            key: 'status',
            name: '问题状态',
            sortable: false,
            width: 100,
            format: 'statusHtml'
        }, {
            name: '操作',
            sortable: false,
            width: 100,
            format: 'operateHtml'
        }],
        pager: {
          perPages: 20,
          totalItems: 0,
          onJump: function(e, page) {
            vm.feedbackList.PMdata.offset = (page.currentPage - 1) * vm.feedbackList.PMdata.limit;
            vm.feedbackList.getFeedbackList();
          }
        }
      },
      //当前编辑的问题
      currentFeedbackQuestion: {
        id: '',
        question: '',
        intent_type: '',
        answer: ''
      },
      currentIgnoreFeedbackQuestion: {
        id: ''
      },
      //是否忽略当前问题弹窗
      $ignoreFeedbackQuestionDlg: {
        title: '提示:',
        width: 380,
        type: 'confirm',
        onConfirm: function() {
          feedbackList.ignoreFeedback();
				},
				onClose: function() {
				}
      },
      //编辑问题弹窗
      $editFeedbackQuestionDlg: {
        title: '编辑问题',
				type: 'confirm',
        width: 680,
        onConfirm: function() {
          feedbackList.updateFeedbackQuestion();
				},
				onClose: function() {
				}
      },

      getFeedbackList: function() {
        FeedbackList.getFeedbackList()
          .done(function(result) {
            if (result.status === 0) {
              var $feedbackList = vm.$feedbackList,
                  data = result.data || [];
              console.log(data)
              $feedbackList.render(data);
              setTimeout(function() {
                $feedbackList.pager.totalItems = result.count;
              });
            } else {
              vm.pageManage.showAlert(result.message);
            }
          })
          .fail(vm.pageManage.showAlert);
      },

      searchFeedbackList: function() {
        vm.feedbackList.PMdata.offset = 0;
        vm.$feedbackList.pager.currentPage = 1;

        FeedbackList.getFeedbackList()
          .done(function(result) {
            if (result.status === 0) {
              var $feedbackList = vm.$feedbackList,
                  data = result.data || [];

              $feedbackList.render(data);
              setTimeout(function() {
                $feedbackList.pager.totalItems = result.count;
              });
            } else {
              vm.pageManage.showAlert(result.message);
            }
          })
          .fail(vm.pageManage.showAlert);
      },

      editFeedbackQuestion: function() {
        var id = this.getAttribute('data-id'),
            question = this.getAttribute('data-question'),
            answer = this.getAttribute('data-answer'),
            intent_type = this.getAttribute('data-intent_type');

        vm.feedbackList.currentFeedbackQuestion.id = id;
        vm.feedbackList.currentFeedbackQuestion.question = question;
        vm.feedbackList.currentFeedbackQuestion.answer = answer;
        vm.feedbackList.currentFeedbackQuestion.intent_type = intent_type;
        vm.$editFeedbackQuestionDlg.toggle = true;
      },

      updateFeedbackQuestion: function(){
        FeedbackList.updateFeedbackQuestion()
          .done(function(result) {
            if (result.status === 0) {
              feedbackList.getFeedbackList();
            } else {
              vm.pageManage.showAlert(result.message);
            }
          })
          .fail(vm.pageManage.showAlert);
      },

      handleIgnoreFeedback: function() {
        var id = this.getAttribute('data-id'),
            question = this.getAttribute('data-question');

        vm.$ignoreFeedbackQuestionDlg.setContent('确定忽略 '+ question +' 这个问题');
        vm.feedbackList.currentIgnoreFeedbackQuestion.id = id;
        vm.$ignoreFeedbackQuestionDlg.toggle = true;
      },

      ignoreFeedback: function() {
        FeedbackList.ignoreFeedback()
          .done(function(result) {
            if (result.status === 0) {
              feedbackList.getFeedbackList();
            } else {
              vm.pageManage.showAlert(result.message);
            }
          })
          .fail(vm.pageManage.showAlert);
      }
    });
    avalon.nextTick(function() {
      avalon.scan();
      vm.feedbackList.getFeedbackList();
  });
  },
  getFeedbackList: function() {
    var params = avalon.mix({}, vm.pageManage.$model.reqData, vm.feedbackList.PMdata.$model);

    return avalon.ajax({
      url: config.feedbackList,
      type: 'POST',
      data: params,
      dataType: 'json'
    });
  },

  updateFeedbackQuestion: function() {
    if (!vm.feedbackList.currentFeedbackQuestion.$model.question.replace(/^\s\s*/, '').replace(/\s\s*$/, '')) {
      vm.pageManage.showAlert('问题不能为空');
      return false;
    }

    if (!vm.feedbackList.currentFeedbackQuestion.$model.answer.replace(/^\s\s*/, '').replace(/\s\s*$/, '')) {
      vm.pageManage.showAlert('答案不能为空');
      return false;
    }

    var params = avalon.mix({}, vm.pageManage.$model.reqData, vm.feedbackList.currentFeedbackQuestion.$model);

    return avalon.ajax({
      url: config.updateFeedback,
      type: 'POST',
      data: params,
      dataType: 'json'
    });
  },

  ignoreFeedback: function() {
    var params = avalon.mix({}, vm.pageManage.$model.reqData, vm.feedbackList.currentIgnoreFeedbackQuestion.$model);

    return avalon.ajax({
      url: config.ignoreFeedback,
      type: 'POST',
      data: params,
      dataType: 'json'
    });
  },

  getUser: function() {
    return avalon.ajax({
      url: config.getUser,
      type: 'GET',
      dataType: 'json'
    });
  }
};

module.exports = FeedbackList;
