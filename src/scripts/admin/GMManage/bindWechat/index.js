var tpl = require('./index.string');

String.prototype.trim = String.prototype.trim || function() {
    return this.replace(/^\s+|\s+$/g, '');
};

// var apiDomain = '//zt.test.test.com'; open
var apiDomain = '/';

var bindWechat = new Vue({
    el: '#vue_app',
    template: tpl,
    data: function() {
        this.waiterListVM = null;
        return {
            dialogBindingWechat: false,
            qrcode: ''
        };
    },
    methods: {
        dialogClosed: function() {
            this.dialogBindingWechat = false;
            if (this.waiterListVM) {
                this.waiterListVM.getGMList();
            }
        },
        bindAccount: function(successFn) {
            var self = this;
            $.ajax({
                url: apiDomain + '/wechat/wechat_to_qchat/create_qrcode.php',
                type: 'GET',
                dataType: 'jsonp',
                success: function(res) {
                    if (res.ret && res.data) {
                        self.qrcode = res.data.qrcode;
                        self.dialogBindingWechat = true;
                        successFn && successFn();
                    } else {
                        self.$alert(res.msg, '错误');
                    }
                }
            });
        },
        unbind: function(successFn) {
            var self = this;
            $.ajax({
                url: apiDomain + '/wechat/wechat_to_qchat/unsubscribe_api.php',
                type: 'GET',
                dataType: 'jsonp',
                success: function(res) {
                    if (res.ret) {
                        self.$alert('解绑成功', '提示');
                        successFn && successFn();
                    } else if (res.msg) {
                        self.$alert(res.msg, '提示');
                    }
                }
            });
        }
    }
});

module.exports = {
    init: function(waiterListVM) {
        bindWechat.waiterListVM = waiterListVM;
    },
    bindAccount: bindWechat.bindAccount.bind(bindWechat),
    unbind: bindWechat.unbind.bind(bindWechat)
};