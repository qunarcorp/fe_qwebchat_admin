var avalon = require("avalon"),
tmpl = "<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-disabled:!enable\"\n     ms-class-1=\"oni-state-focus: focusClass\"\n     ms-css-width=\"{{width}}\"\n     ms-hover=\"oni-state-hover\"\n     ms-keydown=\"_keydown\"\n     tabindex=\"0\">\n    <div class=\"oni-dropdown-source\">\n        <div class=\"oni-dropdown-input\"\n             ms-title=\"title\" ms-css-width=\"titleWidth\" id=\"title-MS_OPTION_ID\">\n            <i class=\"oni-icon\"\n               ms-class=\"{{currentOption.data.iconClass}}\">{{currentOption.data.font|html}}</i>\n        </div>\n        <div class=\"oni-dropdown-icon-wrap\">\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-up\"\n               ms-if=\"toggle\">&#xf028;</i>\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-down\"\n               ms-if=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n</div>\nMS_OPTION_TEMPLATE\n<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-menu:!multiple\"\n     ms-css-width=\"{{listWidth}}\"\n     ms-mouseenter=\"_listenter\"\n     ms-mouseleave=\"_listleave\"\n     ms-visible=\"toggle||multiple\">\n    <div class=\"oni-dropdown-menu-inner\"\n         ms-css-width=\"menuWidth\"\n         ms-css-height=\"menuHeight\"\n         ms-widget=\"scrollbar,scrollbar-MS_OPTION_ID\" id=\"menu-MS_OPTION_ID\">\n        <div class=\"oni-scrollbar-scroller\"\n             id=\"list-MS_OPTION_ID\">\n            <div ms-repeat=\"data\"  class=\"oni-dropdown-item\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                 ms-click-12=\"_select($index, $event)\"\n                 ms-title=\"el.title||el.label\"\n                 ms-hover=\"oni-state-hover: el.enable\"\n                 ms-class-1=\"oni-state-disabled:!el.enable\"\n                 ms-class-2=\"oni-state-active:isActive(el) \"\n                 ms-class-4=\"oni-dropdown-group:el.group\"\n                 ms-class-5=\"oni-dropdown-divider:el.group && !$first\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                    >{{el.label|sanitize|html}}</div>\n        </div>\n    </div>\n</div>\n";
require("../switchdropdown/avalon.switchdropdown");
require("../avalon.getModel");

module.exports = (
function () {
    //使用switchdropdown做代理，包装option，内部使用dropdown组件实现
    var widget = avalon.ui.miniswitch = function (element, data, vmodels) {
            var options = data.miniswitchOptions;
            var vmodel = avalon.define('miniswitch' + setTimeout('1'), function (vm) {
                    vm.$opts = options;
                    vm.$init = function (continueScan) {
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('\u8BF7\u5C3D\u5FEB\u5347\u5230avalon1.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                });
            avalon(element).attr('ms-widget', [
                'switchdropdown',
                data.miniswitchId,
                '$opts'
            ].join());
            return vmodel;
        };
    widget.version = '1.0';
    widget.defaults = {
        width: 40,
        //@config 自定义宽度
        listWidth: 100,
        //@config 自定义下拉列表的宽度
        height: 60,
        //@config 下拉列表的高度
        enable: true,
        //@config 组件是否可用
        readOnly: false,
        //@config 组件是否只读
        data: [],
        //@config 下拉列表显示的数据模型
        value: '',
        //@config 设置组件的初始值
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} VM
         * @returns {String} 新模板
         */
        getTemplate: function () {
            return tmpl;
        },
        onInit: avalon.noop
    };
}
)();