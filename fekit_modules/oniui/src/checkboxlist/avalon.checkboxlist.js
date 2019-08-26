var avalon = require("../avalon.getModel"),
template = "<li class=\"oni-checkboxlist-item oni-checkboxlist-all\" \n    ms-css-float=\"vertical? 'none': 'left'\" \n    ms-if=\"!!alltext\"\n    ms-class=\"fl:!vertical\">\n    <label ms-if=\"data.size()\">\n        <input type=\"checkbox\" \n               ms-click=\"_clickAll($event)\" \n               ms-duplex-checked=\"all\" \n               value = \"all\"\n               class=\"checkbox\"/> {{alltext}}\n    </label>\n</li>\n<li ms-repeat-cpitem=\"data\" class=\"oni-checkboxlist-item\" \n    ms-css-float=\"vertical? 'none': 'left'\"\n    ms-class=\"fl:!vertical\">\n    <label>\n        <input type=\"checkbox\" \n               ms-click=\"_clickOne($event, $index)\"\n               ms-duplex=\"MS_OPTIONS_DUPLEX\"\n               ms-value=\"{{cpitem.value||cpitem.text}}\" \n               class=\"checkbox\" /> \n        {{cpitem.text|html}}\n    </label>\n</li>\n";

module.exports = (
function () {
    var widget = avalon.ui.checkboxlist = function (element, data, vmodels) {
            var options = data.checkboxlistOptions, fetchVM = typeof options.fetch === 'string' ? avalon.getModel(options.fetch, vmodels) : options.fetch, fetchFunc = fetchVM && avalon.type(fetchVM) === 'array' && fetchVM[1][fetchVM[0]] || options.fetch || null, onSelectVM = typeof options.onSelect === 'string' ? avalon.getModel(options.onSelect, vmodels) : false, onSelect = onSelectVM && onSelectVM[1][onSelectVM[0]] || avalon.noop, onfetch = avalon.type(fetchFunc) === 'function' ? fetchFunc : null;
            var vmodel = avalon.define(data.checkboxlistId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'keys'
                    ];
                    vm.widgetElement = element;
                    vm.keys = [];
                    // 点击全选按钮之后的回调
                    vm._clickAll = function (event) {
                        setTimeout(function () {
                            var checkStatus = event.target.checked;
                            if (checkStatus) {
                                duplexVM[1][duplexVM[0]] = vmodel.keys.map(function (el) {
                                    return el + '';
                                });
                            } else {
                                duplexVM[1][duplexVM[0]].clear();
                            }
                            // 执行onselect回调
                            onSelect.apply(0, [
                                vm.data.$model,
                                checkStatus,
                                event.target
                            ]);
                        }, 20);
                    };
                    // 选中某一项之后的回调操作
                    vm._clickOne = function (event, index) {
                        onSelect.apply(0, [
                            vm.data.$model,
                            event.target.checked,
                            event.target
                        ]);
                    };
                    vm.$init = function (continueScan) {
                        var temp = template.replace('MS_OPTIONS_DUPLEX', options.duplex);
                        vmodel.template = vmodel.getTemplate(temp, options);
                        element.className += ' oni-checkboxlist oni-checkboxlist-list oni-helper-clearfix';
                        element.innerHTML = vmodel.template;
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                    vm.$remove = function () {
                        element.innerHTML = '';
                    };
                });
            var duplexVM = avalon.getModel(options.duplex, [vmodel].concat(vmodels)), duplexArr = duplexVM && duplexVM[1][duplexVM[0]];
            vmodel.data.$watch('length', function (len) {
                if (len) {
                    setKeys(vmodel, duplexArr);
                }
            });
            if (!duplexArr) {
                throw new Error('\u672A\u914D\u7F6Eduplex');
            }
            element.value = duplexArr.$model.join(',');
            // 为了兼容 jvalidator，将ul的value同步为duplex的值
            duplexArr.$watch('length', function (newValue) {
                // 当选中checkbox或者全校选中时判断vmodel.all，从而判断是否选中"全选"按钮
                if (newValue == 0) {
                    element.value = '';
                } else {
                    element.value = duplexVM[1][duplexVM[0]].join(',');
                }
                vmodel.all = newValue == vmodel.data.length;
            });
            if (vmodel.data.length) {
                setKeys(vmodel, duplexArr);
                return vmodel;
            }
            if (options.fetch) {
                /*
                通过回调返回数据，数据结构必须是
                [
                    { text : A , value : B , extra : C , ... }
                ]
                以 text 作为每一个选项的文字，value 为选项的值，如果没有则直接使用 text
            */
                // 取到数据之后进行视图的渲染
                onfetch.apply(0, [function (data) {
                        vmodel.data = data;
                        var data = [];
                        avalon.each(vmodel.data, function (index, item) {
                            data.push(item.value || item.text);
                        });
                        vmodel.keys = data;
                    }]);
            } else {
                var fragment = document.createElement('div');
                while (element.firstChild) {
                    fragment.appendChild(element.firstChild);
                }
                switch (options.type) {
                // 配置了type为week的话，使用组件默认的提供的data
                case 'week':
                    var data = [
                            {
                                text: '\u5468\u4E00',
                                value: 'MONDAY'
                            },
                            {
                                text: '\u5468\u4E8C',
                                value: 'TUESDAY'
                            },
                            {
                                text: '\u5468\u4E09',
                                value: 'WEDNESDAY'
                            },
                            {
                                text: '\u5468\u56DB',
                                value: 'THURSDAY'
                            },
                            {
                                text: '\u5468\u4E94',
                                value: 'FRIDAY'
                            },
                            {
                                text: '\u5468\u516D',
                                value: 'SATURDAY'
                            },
                            {
                                text: '\u5468\u65E5',
                                value: 'SUNDAY'
                            }
                        ];
                    break;
                default:
                    // 既未配置fetch自取data，也没配置type使用默认的data，就需要通过页面提供的html抽取出data
                    var inputs = fragment.getElementsByTagName('input');
                    var data = [];
                    for (var i = 0; i < inputs.length; i++) {
                        var input = inputs[i], li = input.parentNode, txt = '';
                        // 获取离input最近的父级li元素
                        while (li) {
                            if (li.tagName == 'LI') {
                                break;
                            } else {
                                li = li.parentNode;
                            }
                        }
                        txt = li.textContent || li.innerText;
                        // trim掉li元素中文本两边的空格
                        txt.replace(/^\s+/, '').replace(/\s+$/, '');
                        // 将提取出来的数据保存在data中
                        data.push({
                            text: txt,
                            value: input.value || txt
                        });
                    }
                    break;
                }
                vmodel.data = data;
            }
            avalon.ui.checkboxlist.defaults.data = [];
            return vmodel;
        };
    function setKeys(vmodel, duplexVM) {
        var data = [], allChecked = true;
        duplexVM = duplexVM && duplexVM.$model;
        avalon.each(vmodel.data, function (index, item) {
            data.push(item.value || item.text);
        });
        vmodel.keys = data;
        avalon.each(data, function (index, item) {
            if (duplexVM.indexOf(item) === -1) {
                allChecked = false;
            }
        });
        vmodel.all = allChecked;
    }
    widget.version = 1;
    widget.defaults = {
        data: [],
        //@config 所有选项值的集合，通过此数据来渲染初始视图。可以在组件初始化之前配置data，也可以在异步取得数据之后在配置。当同时配置了data、fetch且在绑定元素内部显示设置了要渲染的checkbox列表，则优先级顺序是：data>fetch>sub elements
        all: false,
        //@config 默认不选中所有选项
        alltext: '\u5168\u90E8',
        //@config 显示"全部"按钮，方便进行全选或者全不选操作,不需要全选操作的话可以设置alltext为""
        type: '',
        //@config 内置type为week时的data，用户只需配置type为week即可显示周一到周日的选项 
        /**
         * @config 通过配置fetch来获得要显示的数据，数据格式必须如下所示：
             <pre class="brush:javascript;gutter:false;toolbar:false">
             [
                { text : '文字1' , value : 'w1' } ,
                { text : '文字2' , value : 'w2' } ,
                { text : '文字3' , value : 'w3' } ,
                { text : '文字4' , value : 'w4' }
             ]
             </pre>
         */
        fetch: '',
        template: '',
        /**
         * @config {Function} 组件面板展开后的回调函数
         * @param data {Array} checkboxlist的选项集合
         * @param checkStatus {Boolean} 选中或者未选中的状态
         * @param target {ElementObj} 触发事件的dom对象的引用 
         */
        onSelect: avalon.noop,
        getTemplate: function (tmpl, options) {
            return tmpl;
        },
        vertical: true    //@config 如果希望选框水平排列则设置vertical为false，默认垂直排列
    };
    return avalon;
}
)();