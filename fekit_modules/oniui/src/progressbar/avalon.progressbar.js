var avalon = require("avalon"),
template = "<div ms-if=\"!circle\" class=\"oni-progressbar oni-helper-reset oni-helper-clearfix oni-widget oni-widget-content oni-progressbar-normal\" \t  ms-class-100=\"oni-progressbar-indeterminate:indeterminate\" \n\t ms-class-101=\"oni-progressbar-haslabel:label\" \n\t ms-class-102=\"oni-progressbar-right:inTwo\" \n\t ms-visible=\"toggle\">\n\t<div ms-class-100=\"oni-helper-hidden:inTwo\" class=\"oni-progressbar-label\" ms-if=\"label\">{{_labelShower(value, 'l1') | html}}\n\t\t<b ms-if=\"!inTwo\" class=\"oni-progressbar-arrow\"></b>\n\t</div>\n\t<div class=\"oni-progressbar-bar\" ms-css-width=\"{{_cssMaker()}}\">\n\t\t<div class=\"oni-progressbar-label\" ms-if=\"_showLabel(label, inTwo)\">{{_labelShower(value) | html}}\n\t\t<b ms-if=\"inTwo\" class=\"oni-progressbar-arrow\"></b></div>\n\t\t<div class=\"oni-progressbar-overlay\" ms-if=\"_indeterminate()\">       \n\t\t</div>\n\t</div>\n\t<div class=\"oni-progressbar-bar oni-progressbar-bar-right\" ms-if=\"inTwo\" ms-css-width=\"{{_cssMaker('inTwo')}}\">\n\t\t<div class=\"oni-progressbar-label\" ms-if=\"_showLabel(label, inTwo)\">\n\t\t<div class=\"oni-progressbar-overlay\" ms-if=\"_indeterminate()\">\n\t\t</div>{{_labelShower(value, \"inTwo\") | html}}\n\t\t<b ms-if=\"inTwo\" class=\"oni-progressbar-arrow\"></b></div>\n\t</div>\n</div>\n<div ms-if=\"circle\" class=\"oni-progressbar oni-helper-reset oni-helper-clearfix oni-widget oni-widget-content oni-progressbar-circle\" ms-class-100=\"oni-progressbar-indeterminate:indeterminate\" ms-class-101=\"oni-progressbar-haslabel:label\" ms-css-height=\"circleRadius*2+'px'\" ms-css-width=\"circleRadius*2+'px'\">\n\t<div class=\"oni-helper-hidden oni-progressbar oni-progressbar-circle-par\"></div>\n\t<div class=\"oni-progressbar-hidden oni-progressbar-circle-bar\"></div>\n\t<svg ms-if=\"svgSupport\"\n\twidth=\"100%\" \n\theight=\"100%\" \n\tstyle=\"position:absolute;z-index:3;\" \n\tversion=\"1.1\" \n\txmlns=\"http://www.w3.org/2000/svg\">\n\t\t<path ms-attr-d=\"circleCoordinates\" \n\t\tms-if=\"circleCoordinates\" \n\t\tms-attr-stroke=\"circleBorderColor\" \n\t\tms-attr-stroke-width=\"circleBorderWidth\" \n\t\tstroke-linejoin=\"round\" ms-attr-fill=\"circleColor\"></path>\n\t\t<path ms-if=\"barCoordinates\" \n\t\tms-attr-d=\"barCoordinates\" \n\t\tms-attr-stroke=\"circleBarColor\" \n\t\tms-attr-stroke-width=\"circleBorderWidth\" \n\t\tstroke-linejoin=\"round\" \n\t\tfill=\"none\"></path>\n\t</svg>\n\t<v:arc ms-if=\"!svgSupport\"  \n    filled=\"false\" \n    stroked=\"true\" \n    ms-css-left=\"circleBorderWidth+'px'\" \n    ms-css-top=\"circleBorderWidth+'px'\" \n    ms-css-height=\"(circleRadius-circleBorderWidth)*2+'px'\" \n    ms-css-width=\"(circleRadius-circleBorderWidth)*2+'px'\" \n    ms-attr-strokecolor=\"circleBarColor\" \n    ms-attr-strokeweight=\"circleBorderWidth +'px'\" \n    style=\"position:absolute;z-index:3;behavior:url(#default#VML);text-indent:-1000px;overflow:hidden;\" \n    startangle=\"0\" \n    ms-attr-endangle=\"angel\">\n\t</v:arc>\n   \t<v:oval ms-if=\"!svgSupport\"  \n\tstroked=\"true\" \n    ms-css-left=\"circleBorderWidth+'px'\" \n    ms-css-top=\"circleBorderWidth+'px'\" \n\tms-css-height=\"(circleRadius-circleBorderWidth)*2+'px'\" \n\tms-css-width=\"(circleRadius-circleBorderWidth)*2+'px'\" \n\tms-attr-fillcolor=\"circleColor\" \n\tms-attr-strokecolor=\"circleBorderColor\" \n\tms-attr-strokeweight=\"circleBorderWidth+'px'\" \n\tstyle=\"position:absolute;z-index:2;behavior:url(#default#VML);\"></v:oval>\n    <div class=\"oni-progressbar-label\" \n\tms-css-line-height=\"circleRadius*2-4+'px'\" \n    ms-if=\"label\">{{_labelShower(value) | html}}</div>\n</div>";

module.exports = (
function () {
    // 园的半径，边框宽度
    function circleValueList(r, bw) {
        var arr = [], r = r - bw, arc, x, y, res;
        for (var i = 0; i <= 100; i++) {
            arc = Math.PI / 2 - Math.PI / 50 * i;
            x = Math.cos(arc) * r + r * 1 + bw * 1;
            y = (1 - Math.sin(arc).toFixed(4)) * r + bw * 1;
            res = (i ? ' L' : 'M') + x + ' ' + y + (i == 100 ? 'Z' : '');
            arr.push(res);
        }
        return arr;
    }
    var svgSupport = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
    var widget = avalon.ui.progressbar = function (element, data, vmodels) {
            var options = data.progressbarOptions;
            //方便用户对原始模板进行修改,提高制定性
            options.template = options.getTemplate(template, options);
            var vmodel = avalon.define(data.progressbarId, function (vm) {
                    avalon.mix(vm, options);
                    vm.widgetElement = element;
                    var newElem = element, simulateTimer, barElement, labelElement, barParElement;
                    vm.$d = svgSupport && vm.circle && circleValueList(options.circleRadius, options.circleBorderWidth) || [];
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'svgSupport'
                    ];
                    vm.svgSupport = svgSupport;
                    vm.ended = false;
                    // svg绘制一个圆，路径数据
                    vm.circleCoordinates = '';
                    // svg绘制扇形，进度条效果，路径数据
                    vm.barCoordinates = '';
                    vm.angel = options.value || 0;
                    vm.successValue = vm.countDown ? 0 : 100;
                    vm.value = vm.countDown ? 100 : vm.value;
                    vm.angel = vm.countDown ? 360 : 360 * vm.angel / 100;
                    var inited;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        newElem.innerHTML = vmodel.template;
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            // callback after inited
                            if (typeof options.onInit === 'function') {
                                //vmodels是不包括vmodel的 
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        if (vmodel.label) {
                            var nodes = newElem.getElementsByTagName('div');
                            avalon.each(nodes, function (i, item) {
                                var ele = avalon(item);
                                if (vmodel.circle) {
                                    if (ele.hasClass('oni-progressbar-circle-par')) {
                                        barParElement = ele;
                                    } else if (ele.hasClass('oni-progressbar-circle-bar')) {
                                        barElement = ele;
                                    }
                                } else {
                                    if (ele.hasClass('oni-progressbar-label')) {
                                        labelElement = item;
                                    } else if (ele.hasClass('oni-progressbar-bar')) {
                                        barElement = item;
                                        barParElement = item.parentNode;
                                    }
                                }
                            });
                        }
                        vmodel.$d = svgSupport && vmodel.circle && circleValueList(vmodel.circleRadius, vmodel.circleBorderWidth) || [];
                        vmodel.circleBar();
                        vmodel.circleCoordinates = vmodel.$d.join('');
                        // 开启模拟效果
                        vmodel._simulater();
                        if (typeof options.onInit === 'function') {
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    // 适用svg绘制圆圈的v生成方式
                    // vml不走这个逻辑，有直接绘制圆弧的方法
                    vm.circleBar = function (v) {
                        if (vmodel.circle || !svgSupport) {
                            var v = v || vmodel.value || 0;
                            v = v > 100 ? 100 : v > 0 ? v : 0;
                            vmodel.barCoordinates = v == 100 ? vmodel.circleCoordinates : vmodel.$d.slice(0, v + 1).join('') + (v < 100 && v ? '' : 'Z');
                        }
                    };
                    // 计算label tip的位置
                    vm._getLeft = function () {
                        if (vmodel.circle || !labelElement || vmodel.inTwo)
                            return;
                        var bw = barElement && barElement.offsetWidth || 0, lw = labelElement.offsetWidth || 0, bpw = barParElement && barParElement.offsetWidth || 0, res = bpw - bw > lw + 2 ? bw - lw / 2 + 2 : bpw - lw;
                        res = res > 0 ? res : 0;
                        labelElement.style.left = res + 'px';
                    };
                    // 进度条模拟
                    vm._simulater = function () {
                        if (vmodel.simulate !== false && !vmodel.indeterminate) {
                            clearTimeout(simulateTimer);
                            simulateTimer = setTimeout(function () {
                                if (vmodel.success || vmodel.ended || vmodel.indeterminate)
                                    return clearTimeout(simulateTimer);
                                var v = vmodel.simulater(vmodel.value || 0, vmodel);
                                if (vmodel.success) {
                                    v = vmodel.successValue;
                                    vmodel.value = v;
                                    return;
                                }
                                if (vmodel.ended)
                                    return;
                                if (vmodel.countDown) {
                                    if (v <= 0)
                                        return;
                                } else {
                                    if (v >= 100)
                                        return;
                                }
                                vmodel.value = v;
                                simulateTimer = setTimeout(arguments.callee, vmodel.simulate);
                            }, vmodel.simulate);
                        }
                    };
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                    };
                    // 设置bar元素宽度
                    vm._cssMaker = function (inTwo) {
                        if (vmodel.value === false && vmodel.indeterminate || vmodel.value == 100)
                            return inTwo ? 0 : '100%';
                        return inTwo ? 100 - (vmodel.value || 0) + '%' : (vmodel.value || 0) + '%';
                    };
                    // 不知当前进度
                    vm._indeterminate = function () {
                        return vmodel.indeterminate && vmodel.value == false && !vmodel.inTwo;
                    };
                    // 进度条分成左右两段显示的时候是否显示label
                    vm._showLabel = function (label, inTwo) {
                        return label && inTwo;
                    };
                    // 展示label
                    vm._labelShower = function (value) {
                        return vmodel.labelShower.call(vmodel, arguments[0], arguments[1], vmodel);
                    };
                    //@interface start() 开始进度推进，该接口适用于模拟进度条
                    vm.start = function () {
                        vmodel.indeterminate = false;
                        vmodel.ended = false;
                        vmodel._simulater();
                    };
                    //@interface end(value) 结束进度推进，该接口适用于模拟进度条，value为100表示结束，failed表示失败，undefine等于pause，其他则终止于value，并在label上显示
                    vm.end = function (value) {
                        clearTimeout(simulateTimer);
                        vmodel.ended = true;
                        if (value != void 0)
                            vmodel.value = value;
                    };
                    //@interface reset(value) 重置设置项，参数可选，为需要重设的值
                    vm.reset = function (value) {
                        var obj = {};
                        avalon.mix(obj, {
                            value: value != void 0 ? value : widget.defaults.value,
                            indeterminate: widget.defaults.indeterminate,
                            success: false
                        });
                        avalon.mix(vmodel, obj);
                        vmodel.ended = false;
                        vmodel.successValue = vmodel.countDown ? 0 : 100;
                        vmodel.value = vmodel.countDown ? 100 : vmodel.value;
                        vmodel._simulater();
                    };
                    //@interface progress(value) 设置value值，其实也可以直接设置vmodel.value
                    vm.progress = function (value) {
                        vmodel.value = value;
                    };
                });
            // 模拟进度条情形下，不监控success属性的变化
            vmodel.$watch('success', function (newValue) {
                if (newValue && vmodel.simulate)
                    vmodel.value = vmodel.successValue;
                if (newValue)
                    vmodel.onComplete.call(vmodel);
            });
            vmodel.$watch('value', function (newValue) {
                if (newValue == vmodel.successValue)
                    vmodel.success = true;
                vmodel.circle && vmodel.circleBar();
                vmodel._getLeft();
                vmodel.angel = 360 * newValue / 100;
                vmodel.onChange && vmodel.onChange.call(vmodel, newValue);
            });
            return vmodel;
        };
    widget.defaults = {
        toggle: true,
        //@config 组件是否显示，可以通过设置为false来隐藏组件
        value: false,
        //@config 当前进度值 0 - 100 or false
        label: true,
        //@config 是否在进度条上显示进度数字提示
        simulate: false,
        //@config 是否模拟进度条效果，默认为否，模拟的时候需要调用触发告知完成，模拟会采用模拟函数及算子进行模拟，取值为int表示动画效果间隔ms数
        indeterminate: false,
        //@config 是否不确定当前进度，现在loading效果
        countDown: false,
        //@config 倒计时
        inTwo: false,
        //@config 是否显示左右两段
        circle: false,
        //@config 圆形
        circleColor: '#ffffff',
        //@config 圆形填充色彩，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBorderColor: '#dedede',
        //@config 圆形边框颜色，，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBarColor: '#619FE8',
        //@config 圆形进度条边框颜色，可以配制为从皮肤中提取，只在初始化的时候提取
        circleRadius: 38,
        //@config 圆形的半径，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBorderWidth: 4,
        //@config 圆形的边框宽度，可以配制为从皮肤中提取，只在初始化的时候提取
        success: false,
        //@config 是否完成，进度为100时或者外部将success置为true，用于打断模拟效果
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        //@config simulater(value, vmodel) 模拟进度进行效果函数，参数为当前进度和vmodel，默认return value + 5 * Math.random() >> 0
        simulater: function (i, vmodel) {
            if (vmodel.countDown)
                return i - 5 * Math.random() >> 0;
            return i + 5 * Math.random() >> 0;
        },
        //@config getTemplate(tmp, opts) 用于修改模板的接口，默认不做修改
        getTemplate: function (tmpl, opts) {
            return tmpl;
        },
        //@config getTemplate(tpl, opts) 定制修改模板接口
        //@config onChange(value) value发生变化回调，this指向vmodel
        onChange: avalon.noop,
        //@config onComplete() 完成回调，默认空函数，this指向vmodel
        onComplete: avalon.noop,
        //@config labelShower(value, isContainerLabel) 用于格式化进度条上label显示文字，默认value为false显示“loading…”，完成显示“complete!”，失败显示“failed!”，第二个参数是是否是居中显示的label，两段显示的时候，默认将这个label内容置空，只显示两边的label,this指向vmodel
        labelShower: function (value, l1, vmodel) {
            var value = l1 == 'inTwo' ? 100 - (value || 0) : value;
            var successValue = vmodel ? vmodel.successValue : 100;
            if (l1 == 'l1' && vmodel.inTwo)
                return '';
            if (value === false)
                return 'loading\u2026';
            if (value === 'failed')
                return 'failed!';
            if (value == successValue)
                return 'complete!';
            return value + '%';
        },
        $author: 'skipper@123'
    };
}
)();