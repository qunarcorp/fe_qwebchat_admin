var avalon = require("../avalon.getModel"),
sourceHTML = "<div class=\"oni-spinner oni-widget\">\n    <button type=\"button\" class=\"oni-btn\" \n            ms-click=\"_sub\" \n            ms-disabled=\"min==value || disabled\"\n            ms-class=\"oni-state-disabled:min==value || disabled\">\n        <i class=\"oni-icon oni-icon-minus\">&#xf085;</i>\n    </button>\n    <div class=\"oni-textbox oni-widget-content\" ms-class=\"oni-state-disabled:disabled\">\n        <div class=\"oni-textbox-input-wrap\">\n            <b>tmp</b>\n        </div>\n    </div>\n    <button type=\"button\" class=\"oni-btn\" \n            ms-click=\"_add\" \n            ms-disabled=\"max==value || disabled\"\n            ms-class=\"oni-state-disabled:max==value || disabled\">\n        <i class=\"oni-icon oni-icon-plus\">&#xf016;</i>\n    </button>\n</div>";

module.exports = (
function () {
    var widget = avalon.ui.spinner = function (element, data, vmodels) {
            var options = data.spinnerOptions, template = sourceHTML, duplex = function () {
                    var inputMsData = element.msData;
                    for (var i in inputMsData) {
                        if (i.indexOf('ms-duplex') === 0) {
                            return inputMsData[i];
                        }
                    }
                }(), duplexVM = duplex && avalon.getModel(duplex, vmodels) || null, disabled = element.msData['ms-disabled'], disabledVM = disabled && avalon.getModel(disabled, vmodels) || null, min = Number(options.min), max = Number(options.max), oldValue = 0, minVM, maxVM;
            if (duplexVM) {
                duplexVM[1].$watch(duplexVM[0], function (val) {
                    if (/[^0-9]/.test(val + '')) {
                        vmodel.value = element.value = oldValue;
                        return;
                    }
                    if (val === '') {
                        return;
                    }
                    val = checkNum(val);
                    vmodel.value = element.value = oldValue = val;
                });
            }
            if (disabledVM) {
                disabledVM[1].$watch(disabledVM[0], function (val) {
                    vmodel.disabled = val;
                });
            }
            if (isNaN(min) && typeof options.min === 'string') {
                minVM = avalon.getModel(options.min, vmodels) || null;
                if (minVM) {
                    minVM[1].$watch(minVM[0], function (val) {
                        vmodel.min = val;
                    });
                    options.min = minVM[1][minVM[0]];
                } else {
                    options.min = NaN;
                }
            }
            if (isNaN(max) && typeof options.max === 'string') {
                maxVM = avalon.getModel(options.max, vmodels) || null;
                if (maxVM) {
                    maxVM[1].$watch(maxVM[0], function (val) {
                        vmodel.max = val;
                    });
                    options.max = maxVM[1][maxVM[0]];
                } else {
                    options.max = NaN;
                }
            }
            options.template = options.getTemplate(template, options);
            element.value = options.value || element.value;
            if (options.value === void 0) {
                options.value = element.value;
            }
            options.disabled = disabled && disabledVM && disabledVM[1][disabledVM[0]] || element.disabled || false;
            var vmodel = avalon.define(data.spinnerId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'step'
                    ];
                    vm.widgetElement = element;
                    var wrapper = null    /*, focusValue = 0*/;
                    vm.$init = function () {
                        wrapper = avalon.parseHTML(options.template).firstChild;
                        var tmpBElement = wrapper.getElementsByTagName('b')[0], tmpBParent = tmpBElement.parentNode, tmpDiv = document.createElement('div'), elementParent = element.parentNode;
                        // 插入临时标签，保证包裹了element的文档碎片最终插入到element原来所在位置
                        decorateElement();
                        // 为element添加相应的类，并绑定事件
                        elementParent.insertBefore(tmpDiv, element);
                        tmpBParent.appendChild(element);
                        // 模板中插入临时DOM节点b，为了方便查找放置input的父节点，将element放到合适的位置之后要移除临时节点
                        tmpBParent.removeChild(tmpBElement);
                        elementParent.replaceChild(wrapper, tmpDiv);
                        avalon.scan(wrapper, [vmodel].concat(vmodels));
                        // 如果输入域的初始值不在spinner的范围，调整它
                        ajustValue();
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm.$remove = function () {
                        wrapper.innerHTML = wrapper.textContent = '';
                        wrapper.parentNode.removeChild(wrapper);
                    };
                    vm._add = function (event) {
                        // add number by step
                        var value = Number(element.value), subValue = 0;
                        subValue = value + (options.step || 1);
                        // 如果subValue不是number类型说明value包含非数值字符，或者options.step包含非数值字符
                        // if(isNaN(subValue)) {
                        //     throw new Error("输入域的值非数值，或者step的设置为非数值，请检查");
                        // }
                        subValue = checkNum(subValue);
                        vmodel.value = element.value = subValue;
                        options.onIncrease.call(event.target, subValue);
                    };
                    vm._sub = function (event) {
                        // minus number by step
                        var value = Number(element.value), subValue = 0;
                        subValue = value - (options.step || 1);
                        if (isNaN(subValue)) {
                            throw new Error('\u8F93\u5165\u57DF\u7684\u503C\u975E\u6570\u503C\uFF0C\u6216\u8005step\u7684\u8BBE\u7F6E\u4E3A\u975E\u6570\u503C\uFF0C\u8BF7\u68C0\u67E5');
                        }
                        subValue = checkNum(subValue);
                        vmodel.value = element.value = subValue;
                        options.onDecrease.call(event.target, subValue);
                    };
                    vm.$watch('min', function () {
                        ajustValue();
                    });
                    vm.$watch('max', function () {
                        ajustValue();
                    });
                });
            function ajustValue() {
                var min = vmodel.min, max = vmodel.max, value = Number(element.value);
                if (typeof min == 'number' && !isNaN(Number(min)) && value < min) {
                    value = min;
                }
                if (typeof max == 'number' && !isNaN(Number(max)) && value > max) {
                    value = max;
                }
                vmodel.value = element.value = value;
            }
            function decorateElement() {
                var $element = avalon(element);
                $element.addClass('oni-textbox-input');
                $element.attr('ms-css-width', 'width');
                $element.attr('ms-class', 'oni-state-disabled:disabled');
                $element.bind('blur', function () {
                    value = element.value;
                    if (!isNaN(Number(value))) {
                        value = checkNum(element.value);
                    }
                    vmodel.value = element.value = value;
                });
                $element.bind('keydown', function (event) {
                    switch (event.which) {
                    case 38:
                        // up
                        vmodel._add(event);
                        return false;
                    case 40:
                        // down
                        vmodel._sub(event);
                        return false;
                    }
                });
            }
            function checkNum(val) {
                // 如果val包含非数值字符，设置为0
                var v = Number(val) || 0, min = vmodel.min, max = vmodel.max;
                // 当设置了数值options.min，且不是NaN，重置v，否则忽略
                if (typeof min == 'number' && !isNaN(Number(min))) {
                    if (v < min)
                        v = min;
                }
                // 当设置了数值options.max，且不是NaN，重置v，否则忽略
                if (typeof max == 'number' && !isNaN(Number(max))) {
                    if (v > max)
                        v = max;
                }
                return parseFloat(v);
            }
            return vmodel;
        };
    widget.version = 1;
    widget.defaults = {
        min: NaN,
        //@config spinner的最小值,默认不存在最小值限制
        max: NaN,
        //@config spinner的最大值，默认不存在最大值限制
        step: 1,
        //@config spinner的步长
        width: 'auto',
        //@config 设置spinner的width
        value: 0,
        //@config spinner的当前值
        disabled: false,
        //@config 是否禁用spinner
        widgetElement: '',
        // accordion容器
        getTemplate: function (str, options) {
            return str;
        },
        /**
         * @config {Function} 减值更新spinner之后的回调
         * @param value {Number} 当前值
         */
        onDecrease: avalon.noop,
        /**
         * @config {Function} 增值更新spinner之后的回调
         * @param value {Number} 当前值
         */
        onIncrease: avalon.noop
    };
    return avalon;
}
)();