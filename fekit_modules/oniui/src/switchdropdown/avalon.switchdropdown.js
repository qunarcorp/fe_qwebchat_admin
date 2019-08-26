var avalon = require("avalon"),
tmpl = "<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-disabled:!enable\"\n     ms-class-1=\"oni-state-focus: focusClass\"\n     ms-css-width=\"{{width}}\"\n     ms-hover=\"oni-state-hover\"\n     ms-keydown=\"_keydown\"\n     tabindex=\"0\">\n    <div class=\"oni-dropdown-source\">\n        <div class=\"oni-dropdown-input\"\n             ms-title=\"title\"\n             ms-css-width=\"titleWidth\"\n             id=\"title-MS_OPTION_ID\">\n            {{currentOption.data.titleValue|sanitize|html}}\n        </div>\n        <div class=\"oni-dropdown-icon-wrap\">\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-up\"\n               ms-if=\"toggle\">&#xf028;</i>\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-down\"\n               ms-if=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n</div>\nMS_OPTION_TEMPLATE\n<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-menu:!multiple\"\n     ms-class-1=\"{{listClass}}\"\n     ms-css-width=\"{{listWidth}}\"\n     ms-mouseenter=\"_listenter\"\n     ms-mouseleave=\"_listleave\"\n     ms-visible=\"toggle||multiple\">\n    <div class=\"oni-dropdown-menu-inner\"\n         ms-css-width=\"menuWidth\"\n         ms-css-height=\"menuHeight\"\n         ms-widget=\"scrollbar,scrollbar-MS_OPTION_ID\" id=\"menu-MS_OPTION_ID\">\n        <div class=\"oni-scrollbar-scroller\"\n             id=\"list-MS_OPTION_ID\">\n            <div ms-repeat=\"data\"  class=\"oni-dropdown-item\"\n                 ms-click-12=\"_select($index, $event)\"\n                 ms-title=\"el.title||el.label\"\n                 ms-hover=\"oni-state-hover: el.enable\"\n                 ms-class-1=\"oni-state-disabled:!el.enable\"\n                 ms-class-2=\"oni-state-active:isActive(el) \"\n                 ms-class-4=\"oni-dropdown-group:el.group\"\n                 ms-class-5=\"oni-dropdown-divider:el.group && !$first\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                    >{{el.label|sanitize|html}}</div>\n        </div>\n    </div>\n</div>\n";
require("../dropdown/avalon.dropdown");
require("../avalon.getModel");

module.exports = (
function () {
    /**
     * 默认的switch item
     * @type {Array}
     * value: option的值
     * label: option的label
     * class: option webfont的样式
     * title: option的title
     * font: option webfont的字符
     */
    var defaultData = [
            {
                value: 1,
                label: ' \u542F\u7528',
                iconClass: 'g-icon-start',
                title: '\u542F\u7528',
                font: '&#xf111;',
                titleValue: ' \u5DF2\u542F\u7528'
            },
            {
                value: 2,
                label: ' \u6682\u505C',
                iconClass: 'g-icon-pause',
                title: '\u6682\u505C',
                font: '&#xf04c;',
                titleValue: ' \u5DF2\u6682\u505C'
            }
        ];
    //使用switchdropdown做代理，包装option，内部使用dropdown组件实现
    var widget = avalon.ui.switchdropdown = function (element, data, vmodels) {
            var options = data.switchdropdownOptions;
            //mix defaultData, getDataFromHTML, options.data
            options.data = setItemLabel(avalon.mix(true, [], defaultData, getDataFromHTML(element), options.data));
            //检测options.value是否可以匹配到options.data中的选项
            //如果不能匹配，首先找到selected的选项
            //如果没有selected的选项，则把value设置为data中的第一项
            for (var preSet = options.value, value = options.data[0].value, i = 0, len = options.data.length, item; i < len; i++) {
                item = options.data[i];
                if (item.value === preSet) {
                    value = preSet;
                    break;
                }
                if (item.selected) {
                    value = item.value;
                }
            }
            options.value = value;
            var vmodel = avalon.define('switchdropdown' + setTimeout('1'), function (vm) {
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
                'dropdown',
                data.switchdropdownId,
                '$opts'
            ].join());
            //由于对数据做预先处理，使用option模式传递数据，将element的内容清空
            element.innerHTML = '';
            return vmodel;
        };
    function getDataFromHTML(select, arr, parent) {
        var ret = arr || [];
        var elems = select.children;
        parent = parent || null;
        for (var i = 0, el; el = elems[i++];) {
            if (el.nodeType === 1) {
                //过滤注释节点
                if (el.tagName === 'OPTION') {
                    var option = {
                            label: ' ' + el.text.trim(),
                            //IE9-10有BUG，没有进行trim操作
                            title: el.title.trim(),
                            value: parseData(avalon(el).val()),
                            enable: !el.disabled,
                            group: false,
                            selected: el.selected,
                            parent: parent
                        };
                    //设置了用于在标题处显示的文案：titleValue
                    if (avalon(el).attr('data-title-value')) {
                        option.titleValue = ' ' + avalon(el).attr('data-title-value').trim();
                    }
                    ret.push(option);
                    if (ret.length === 2)
                        break;
                }
            }
        }
        return ret;
    }
    //设置option的label
    function setItemLabel(items) {
        avalon.each(items, function (i, item) {
            item.text = item.label;
            item.label = [
                '<i class="oni-icon ',
                item.iconClass,
                '">',
                item.font,
                '</i>',
                item.label
            ].join('');
            item.titleValue = [
                '<i class="oni-icon ',
                item.iconClass,
                '">',
                item.font,
                '</i>',
                item.titleValue
            ].join('');
        });
        return items;
    }
    //用于将字符串中的值转换成具体值
    function parseData(data) {
        try {
            data = data === 'true' ? true : data === 'false' ? false : data === 'null' ? null : +data + '' === data ? +data : data;
        } catch (e) {
        }
        return data;
    }
    widget.version = '1.0';
    widget.defaults = {
        width: 100,
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