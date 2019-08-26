var avalon = require("avalon");
require("../mmPromise/mmPromise");

module.exports = (
function () {
    //如果avalon的版本少于1.3.7，那么重写ms-duplex指令，方便直接使用ms-duplex2.0, 只兼容到1.2x
    //但它不支持pipe方法，换言之，不支持类型转换，只做验证
    if (!avalon.duplexHooks) {
        (function () {
            var getBindingCallback = function (elem, name, vmodels) {
                var callback = elem.getAttribute(name);
                if (callback) {
                    for (var i = 0, vm; vm = vmodels[i++];) {
                        if (vm.hasOwnProperty(callback) && typeof vm[callback] === 'function') {
                            return vm[callback];
                        }
                    }
                }
            };
            function createSignalTower(elem, vmodel) {
                var id = elem.getAttribute('avalonctrl') || vmodel.$id;
                elem.setAttribute('avalonctrl', id);
                vmodel.$events.expr = elem.tagName + '[avalonctrl="' + id + '"]';
            }
            avalon.bindingHandlers.widget = function (data, vmodels) {
                var args = data.value.match(avalon.rword);
                var elem = data.element;
                var widget = args[0];
                var id = args[1];
                if (!id || id === '$') {
                    //没有定义或为$时，取组件名+随机数
                    id = widget + setTimeout('1');
                }
                var optName = args[2] || widget;
                //没有定义，取组件名
                vmodels.cb && vmodels.cb(-1);
                var constructor = avalon.ui[widget];
                if (typeof constructor === 'function') {
                    //ms-widget="tabs,tabsAAA,optname"
                    vmodels = elem.vmodels || vmodels;
                    for (var i = 0, v; v = vmodels[i++];) {
                        if (v.hasOwnProperty(optName) && typeof v[optName] === 'object') {
                            var vmOptions = v[optName];
                            vmOptions = vmOptions.$model || vmOptions;
                            break;
                        }
                    }
                    if (vmOptions) {
                        var wid = vmOptions[widget + 'Id'];
                        if (typeof wid === 'string') {
                            id = wid;
                        }
                    }
                    //抽取data-tooltip-text、data-tooltip-attr属性，组成一个配置对象
                    var widgetData = avalon.getWidgetData(elem, widget);
                    data.value = [
                        widget,
                        id,
                        optName
                    ].join(',');
                    data[widget + 'Id'] = id;
                    data.evaluator = avalon.noop;
                    elem.msData['ms-widget-id'] = id;
                    var options = data[widget + 'Options'] = avalon.mix({}, constructor.defaults, vmOptions || {}, widgetData);
                    elem.removeAttribute('ms-widget');
                    var vmodel = constructor(elem, data, vmodels) || {};
                    //防止组件不返回VM
                    if (vmodel.$id) {
                        avalon.vmodels[id] = vmodel;
                        createSignalTower(elem, vmodel);
                        if (vmodel.hasOwnProperty('$init')) {
                            vmodel.$init(function () {
                                var nv = [vmodel].concat(vmodels);
                                nv.cb = vmodels.cb;
                                avalon.scan(elem, nv);
                                if (typeof options.onInit === 'function') {
                                    options.onInit.call(elem, vmodel, options, vmodels);
                                }
                            });
                        }
                        if (vmodel.hasOwnProperty('$remove')) {
                            function offTree() {
                                if (!elem.msRetain && !avalon.contains(document.documentElement, elem)) {
                                    vmodel.$remove();
                                    elem.msData = {};
                                    delete avalon.vmodels[vmodel.$id];
                                    return false;
                                }
                            }
                            if (window.chrome) {
                                elem.addEventListener('DOMNodeRemovedFromDocument', function () {
                                    setTimeout(offTree);
                                });
                            } else {
                                avalon.tick(offTree);
                            }
                        }
                    } else {
                        avalon.scan(elem, vmodels);
                    }
                } else if (vmodels.length) {
                    //如果该组件还没有加载，那么保存当前的vmodels
                    elem.vmodels = vmodels;
                }
            };
            var oldDuplex = avalon.bindingHandlers.duplex;
            avalon.bindingExecutors.duplex = function () {
            };
            var duplexBinding = avalon.bindingHandlers.duplex = function (data, vmodels) {
                    var elem = data.element, tagName = elem.tagName, hasCast;
                    data.changed = getBindingCallback(elem, 'data-duplex-changed', vmodels) || avalon.noop;
                    //由于情况特殊，不再经过parseExprProxy
                    try {
                        avalon.parseExprProxy(data.value, vmodels, data, 'duplex');
                    } catch (e) {
                    }
                    if (data.evaluator && data.args) {
                        var params = [];
                        var casting = avalon.oneObject('string,number,boolean,checked');
                        if (elem.type === 'radio' && data.param === '') {
                            data.param = 'checked';
                        }
                        if (elem.msData) {
                            elem.msData['ms-duplex'] = data.value;
                        }
                        data.param.replace(/\w+/g, function (name) {
                            if (/^(checkbox|radio)$/.test(elem.type) && /^(radio|checked)$/.test(name)) {
                                if (name === 'radio')
                                    log('ms-duplex-radio\u5DF2\u7ECF\u66F4\u540D\u4E3Ams-duplex-checked');
                                name = 'checked';
                                data.isChecked = true;
                                data.msType = 'checked'    //1.3.6中途添加的
;
                            }
                            if (name === 'bool') {
                                name = 'boolean';
                                log('ms-duplex-bool\u5DF2\u7ECF\u66F4\u540D\u4E3Ams-duplex-boolean');
                            } else if (name === 'text') {
                                name = 'string';
                                log('ms-duplex-text\u5DF2\u7ECF\u66F4\u540D\u4E3Ams-duplex-string');
                            }
                            if (casting[name]) {
                                hasCast = true;
                            }
                            avalon.Array.ensure(params, name);
                        });
                        if (!hasCast) {
                            params.push('string');
                        }
                        data.param = params.join('-');
                        data.bound = function (type, callback) {
                            if (elem.addEventListener) {
                                elem.addEventListener(type, callback, false);
                            } else {
                                elem.attachEvent('on' + type, callback);
                            }
                            var old = data.rollback;
                            data.rollback = function () {
                                avalon.unbind(elem, type, callback);
                                old && old();
                            };
                        };
                        for (var i in avalon.vmodels) {
                            var v = avalon.vmodels[i];
                            v.$fire('avalon-ms-duplex-init', data);
                        }
                        duplexBinding[tagName] && duplexBinding[tagName](elem, data.evaluator.apply(null, data.args), data);
                    }
                };
            duplexBinding['INPUT'] = oldDuplex['INPUT'];
            duplexBinding['TEXTAREA'] = oldDuplex['TEXTAREA'];
            duplexBinding['SELECT'] = oldDuplex['SELECT'];
        }());
        function fixNull(val) {
            return val == null ? '' : val;
        }
        avalon.duplexHooks = {
            checked: {
                get: function (val, data) {
                    return !data.element.oldValue;
                }
            },
            string: {
                get: function (val) {
                    //同步到VM
                    return val;
                },
                set: fixNull
            },
            'boolean': {
                get: function (val) {
                    return val === 'true';
                },
                set: fixNull
            },
            number: {
                get: function (val) {
                    return isFinite(val) ? parseFloat(val) || 0 : val;
                },
                set: fixNull
            }
        };
    }
    //==========================avalon.validation的专有逻辑========================
    function idCard(val) {
        if (/^\d{15}$/.test(val)) {
            return true;
        } else if (/^\d{17}[0-9xX]$/.test(val)) {
            var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','), ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','), ss = val.toLowerCase().split(''), r = 0;
            for (var i = 0; i < 17; i++) {
                r += ps[i] * ss[i];
            }
            return vs[r % 11] == ss[17];
        }
    }
    function isCorrectDate(value) {
        if (rdate.test(value)) {
            var date = parseInt(RegExp.$1, 10);
            var month = parseInt(RegExp.$2, 10);
            var year = parseInt(RegExp.$3, 10);
            var xdata = new Date(year, month - 1, date, 12, 0, 0, 0);
            if (xdata.getUTCFullYear() === year && xdata.getUTCMonth() === month - 1 && xdata.getUTCDate() === date) {
                return true;
            }
        }
        return false;
    }
    var rdate = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
    //  var remail = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/
    var remail = /^([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+@([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+\.[A-Z]{2,3}$/i;
    var ripv4 = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i;
    var ripv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i;
    //规则取自淘宝注册登录模块
    var phoneOne = {
            //中国移动
            cm: /^(?:0?1)((?:3[56789]|5[0124789]|8[278])\d|34[0-8]|47\d)\d{7}$/,
            //中国联通
            cu: /^(?:0?1)(?:3[012]|4[5]|5[356]|8[356]\d|349)\d{7}$/,
            //中国电信
            ce: /^(?:0?1)(?:33|53|8[079])\d{8}$/,
            //中国大陆
            cn: /^(?:0?1)[3458]\d{9}$/
        };
    avalon.mix(avalon.duplexHooks, {
        trim: {
            get: function (value, data) {
                if (data.element.type !== 'password') {
                    value = String(value || '').trim();
                }
                return value;
            }
        },
        required: {
            message: '\u5FC5\u987B\u586B\u5199',
            get: function (value, data, next) {
                next(value !== '');
                return value;
            }
        },
        norequired: {
            message: '\u53EF\u4EE5\u4E0D\u5199',
            get: function (value, data, next) {
                next(true);
                return value;
            }
        },
        'int': {
            message: '\u5FC5\u987B\u662F\u6574\u6570',
            get: function (value, data, next) {
                next(/^\-?\d+$/.test(value));
                return value;
            }
        },
        phone: {
            message: '\u624B\u673A\u53F7\u7801\u4E0D\u5408\u6CD5',
            get: function (value, data, next) {
                var ok = false;
                for (var i in phoneOne) {
                    if (phoneOne[i].test(value)) {
                        ok = true;
                        break;
                    }
                }
                next(ok);
                return value;
            }
        },
        decimal: {
            message: '\u5FC5\u987B\u662F\u5C0F\u6570',
            get: function (value, data, next) {
                next(/^\-?\d*\.?\d+$/.test(value));
                return value;
            }
        },
        alpha: {
            message: '\u5FC5\u987B\u662F\u5B57\u6BCD',
            get: function (value, data, next) {
                next(/^[a-z]+$/i.test(value));
                return value;
            }
        },
        alpha_numeric: {
            message: '\u5FC5\u987B\u4E3A\u5B57\u6BCD\u6216\u6570\u5B57',
            get: function (value, data, next) {
                next(/^[a-z0-9]+$/i.test(value));
                return value;
            }
        },
        alpha_dash: {
            message: '\u5FC5\u987B\u4E3A\u5B57\u6BCD\u6216\u6570\u5B57\u53CA\u4E0B\u5212\u7EBF\u7B49\u7279\u6B8A\u5B57\u7B26',
            validate: function (value, data, next) {
                next(/^[a-z0-9_\-]+$/i.test(value));
                return value;
            }
        },
        chs: {
            message: '\u5FC5\u987B\u662F\u4E2D\u6587\u5B57\u7B26',
            get: function (value, data, next) {
                next(/^[\u4e00-\u9fa5]+$/.test(value));
                return value;
            }
        },
        chs_numeric: {
            message: '\u5FC5\u987B\u662F\u4E2D\u6587\u5B57\u7B26\u6216\u6570\u5B57\u53CA\u4E0B\u5212\u7EBF\u7B49\u7279\u6B8A\u5B57\u7B26',
            get: function (value, data, next) {
                next(/^[\\u4E00-\\u9FFF0-9_\-]+$/i.test(value));
                return value;
            }
        },
        qq: {
            message: '\u817E\u8BAFQQ\u53F7\u4ECE10000\u5F00\u59CB',
            get: function (value, data, next) {
                next(/^[1-9]\d{4,10}$/.test(value));
                return value;
            }
        },
        id: {
            message: '\u8EAB\u4EFD\u8BC1\u683C\u5F0F\u9519\u8BEF',
            get: function (value, data, next) {
                next(idCard(value));
                return value;
            }
        },
        ipv4: {
            message: 'ip\u5730\u5740\u4E0D\u6B63\u786E',
            get: function (value, data, next) {
                next(ripv4.test(value));
                return value;
            }
        },
        ipv6: {
            message: 'ip\u5730\u5740\u4E0D\u6B63\u786E',
            get: function (value, data, next) {
                next(ripv6.test(value));
                return value;
            }
        },
        email: {
            message: '\u90AE\u4EF6\u5730\u5740\u9519\u8BEF',
            get: function (value, data, next) {
                next(remail.test(value));
                return value;
            }
        },
        url: {
            message: 'URL\u683C\u5F0F\u9519\u8BEF',
            get: function (value, data, next) {
                next(/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(value));
                return value;
            }
        },
        repeat: {
            message: '\u5BC6\u7801\u8F93\u5165\u4E0D\u4E00\u81F4',
            get: function (value, data, next) {
                var id = data.element.getAttribute('data-duplex-repeat') || '';
                var other = avalon(document.getElementById(id)).val() || '';
                next(value === other);
                return value;
            }
        },
        date: {
            message: '\u5FC5\u987B\u7B26\u5408\u65E5\u671F\u683C\u5F0F YYYY-MM-DD',
            get: function (value, data, next) {
                next(isCorrectDate(value));
                return value;
            }
        },
        passport: {
            message: '\u62A4\u7167\u683C\u5F0F\u9519\u8BEF\u6216\u8FC7\u957F',
            get: function (value, data, next) {
                next(/^[a-zA-Z0-9]{4,20}$/i.test(value));
                return value;
            }
        },
        minlength: {
            message: '\u6700\u5C11\u8F93\u5165{{min}}\u4E2A\u5B57',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('minlength'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-minlength'), 10);
                }
                var num = data.data.min = a;
                next(value.length >= num);
                return value;
            }
        },
        maxlength: {
            message: '\u6700\u591A\u8F93\u5165{{max}}\u4E2A\u5B57',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('maxlength'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-maxlength'), 10);
                }
                var num = data.data.max = a;
                next(value.length <= num);
                return value;
            }
        },
        gt: {
            message: '\u5FC5\u987B\u5927\u4E8E{{max}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('max'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-gt'), 10);
                }
                var num = data.data.max = a;
                next(parseFloat(value) > num);
                return value;
            }
        },
        lt: {
            message: '\u5FC5\u987B\u5C0F\u4E8E{{min}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('min'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-lt'), 10);
                }
                var num = data.data.min = a;
                next(parseFloat(value) < num);
                return value;
            }
        },
        //contain
        eq: {
            message: '\u5FC5\u987B\u7B49\u4E8E{{eq}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('data-duplex-eq'), 10);
                var num = data.data.eq = a;
                next(parseFloat(value) == num);
                return value;
            }
        },
        contains: {
            message: '\u5FC5\u987B\u5305\u542B{{array}}\u4E2D\u7684\u4E00\u4E2A',
            get: function (val, data, next) {
                var vmValue = [].concat(val).map(String);
                var domValue = (data.element.getAttribute('data-duplex-contains') || '').split(',');
                data.data.array = domValue;
                var has = false;
                for (var i = 0, n = vmValue.length; i < n; i++) {
                    var v = vmValue[i];
                    if (domValue.indexOf(v) >= 0) {
                        has = true;
                        break;
                    }
                }
                next(has);
                return val;
            }
        },
        contain: {
            message: '\u5FC5\u987B\u5305\u542B{{array}}',
            get: function (val, data, next) {
                var vmValue = [].concat(val).map(String);
                var domValue = (data.element.getAttribute('data-duplex-contain') || '').split(',');
                data.data.array = domValue.join('\u4E0E');
                if (vmValue.length) {
                    var has = false;
                } else {
                    has = true;
                    for (var i = 0, n = vmValue.length; i < n; i++) {
                        var v = vmValue[i];
                        if (domValue.indexOf(v) === -1) {
                            has = false;
                            break;
                        }
                    }
                }
                next(has);
                return val;
            }
        },
        pattern: {
            message: '\u5FC5\u987B\u5339\u914D/{{pattern}}/\u8FD9\u6837\u7684\u683C\u5F0F',
            get: function (value, data, next) {
                var elem = data.element;
                var h5pattern = elem.getAttribute('pattern');
                var mspattern = elem.getAttribute('data-duplex-pattern');
                var pattern = data.data.pattern = h5pattern || mspattern;
                var re = new RegExp('^(?:' + pattern + ')$');
                next(re.test(value));
                return value;
            }
        }
    });
    //<input type="number" max=x min=y step=z/> <input type="range" max=x min=y step=z/>
    //
    var widget = avalon.ui.validation = function (element, data, vmodels) {
            var options = data.validationOptions;
            var onSubmitCallback;
            var vmodel = avalon.define(data.validationId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'data',
                        'validationHooks',
                        'validateInKeyup',
                        'validateAllInSubmit',
                        'resetInBlur'
                    ];
                    vm.widgetElement = element;
                    vm.data = [];
                    /**
             * @interface 为元素绑定submit事件，阻止默认行为
             */
                    vm.$init = function () {
                        element.setAttribute('novalidate', 'novalidate');
                        avalon.scan(element, [vmodel].concat(vmodels));
                        if (vm.validateAllInSubmit) {
                            onSubmitCallback = avalon.bind(element, 'submit', function (e) {
                                e.preventDefault();
                                vm.validateAll(vm.onValidateAll);
                            });
                        }
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    /**
             * @interface 销毁组件，移除相关回调
             */
                    vm.$destory = function () {
                        vm.data = [];
                        onSubmitCallback && avalon.unbind(element, 'submit', onSubmitCallback);
                        element.textContent = element.innerHTML = '';
                    };
                    /**
             * @interface 验证当前表单下的所有非disabled元素
             * @param callback {Null|Function} 最后执行的回调，如果用户没传就使用vm.onValidateAll
             */
                    vm.validateAll = function (callback) {
                        var fn = typeof callback === 'function' ? callback : vm.onValidateAll;
                        var promise = vm.data.filter(function (el) {
                                return el.element;
                            }).map(function (data) {
                                return vm.validate(data, true);
                            });
                        Promise.all(promise).then(function (array) {
                            var reasons = [];
                            for (var i = 0, el; el = array[i++];) {
                                reasons = reasons.concat(el);
                            }
                            fn.call(vm.widgetElement, reasons)    //这里只放置未通过验证的组件
;
                        });
                    };
                    /**
             * @interface 重置当前表单元素
             * @param callback {Null|Function} 最后执行的回调，如果用户没传就使用vm.onResetAll
             */
                    vm.resetAll = function (callback) {
                        vm.data.filter(function (el) {
                            return el.element;
                        }).forEach(function (data) {
                            try {
                                vm.onReset.call(data.element, { type: 'reset' }, data);
                            } catch (e) {
                            }
                        });
                        var fn = typeof callback == 'function' ? callback : vm.onResetAll;
                        fn.call(vm.widgetElement);
                    };
                    /**
             * @interface 验证单个元素对应的VM中的属性是否符合格式
             * @param data {Object} 绑定对象
             * @param isValidateAll {Undefined|Boolean} 是否全部验证,是就禁止onSuccess, onError, onComplete触发
             * @param event {Undefined|Event} 方便用户判定这是由keyup,还是blur等事件触发的
             */
                    vm.validate = function (data, isValidateAll, event) {
                        var value = data.valueAccessor();
                        var inwardHooks = vmodel.validationHooks;
                        var globalHooks = avalon.duplexHooks;
                        var promises = [];
                        var elem = data.element;
                        data.validateParam.replace(/\w+/g, function (name) {
                            var hook = inwardHooks[name] || globalHooks[name];
                            if (!elem.disabled) {
                                var resolve, reject;
                                promises.push(new Promise(function (a, b) {
                                    resolve = a;
                                    reject = b;
                                }));
                                var next = function (a) {
                                    if (data.norequired && value === '') {
                                        a = true;
                                    }
                                    if (a) {
                                        resolve(true);
                                    } else {
                                        var reason = {
                                                element: elem,
                                                data: data.data,
                                                message: elem.getAttribute('data-duplex-message') || hook.message,
                                                validateRule: name,
                                                getMessage: getMessage
                                            };
                                        resolve(reason);
                                    }
                                };
                                data.data = {};
                                hook.get(value, data, next);
                            }
                        });
                        //如果promises不为空，说明经过验证拦截器
                        var lastPromise = Promise.all(promises).then(function (array) {
                                var reasons = [];
                                for (var i = 0, el; el = array[i++];) {
                                    if (typeof el === 'object') {
                                        reasons.push(el);
                                    }
                                }
                                if (!isValidateAll) {
                                    if (reasons.length) {
                                        vm.onError.call(elem, reasons, event);
                                    } else {
                                        vm.onSuccess.call(elem, reasons, event);
                                    }
                                    vm.onComplete.call(elem, reasons, event);
                                }
                                return reasons;
                            });
                        return lastPromise;
                    };
                    //收集下方表单元素的数据
                    vm.$watch('avalon-ms-duplex-init', function (data) {
                        var inwardHooks = vmodel.validationHooks;
                        data.valueAccessor = data.evaluator.apply(null, data.args);
                        switch (avalon.type(data.valueAccessor())) {
                        case 'array':
                            data.valueResetor = function () {
                                this.valueAccessor([]);
                            };
                            break;
                        case 'boolean':
                            data.valueResetor = function () {
                                this.valueAccessor(false);
                            };
                            break;
                        case 'number':
                            data.valueResetor = function () {
                                this.valueAccessor(0);
                            };
                            break;
                        default:
                            data.valueResetor = function () {
                                this.valueAccessor('');
                            };
                            break;
                        }
                        var globalHooks = avalon.duplexHooks;
                        if (typeof data.pipe !== 'function' && avalon.contains(element, data.element)) {
                            var params = [];
                            var validateParams = [];
                            data.param.replace(/\w+/g, function (name) {
                                var hook = inwardHooks[name] || globalHooks[name];
                                if (hook && typeof hook.get === 'function' && hook.message) {
                                    validateParams.push(name);
                                } else {
                                    params.push(name);
                                }
                                if (name === 'norequired') {
                                    data.norequired = true;
                                }
                            });
                            data.validate = vm.validate;
                            data.param = params.join('-');
                            data.validateParam = validateParams.join('-');
                            if (validateParams.length) {
                                if (vm.validateInKeyup) {
                                    data.bound('keyup', function (e) {
                                        var type = data.element && data.element.getAttribute('data-duplex-event');
                                        if (!type || /^(?:key|mouse|click|input)/.test(type)) {
                                            var ev = fixEvent(e);
                                            setTimeout(function () {
                                                vm.validate(data, 0, ev);
                                            });
                                        }
                                    });
                                }
                                if (vm.validateInBlur) {
                                    data.bound('blur', function (e) {
                                        vm.validate(data, 0, e);
                                    });
                                }
                                if (vm.resetInFocus) {
                                    data.bound('focus', function (e) {
                                        vm.onReset.call(data.element, e, data);
                                    });
                                }
                            }
                            var array = vm.data.filter(function (el) {
                                    return el.element;
                                });
                            avalon.Array.ensure(array, data);
                            vm.data = array;
                            return false;
                        }
                    });
                });
            return vmodel;
        };
    var rformat = /\\?{{([^{}]+)\}}/gm;
    function getMessage() {
        var data = this.data || {};
        return this.message.replace(rformat, function (_, name) {
            return data[name] == null ? '' : data[name];
        });
    }
    widget.defaults = {
        validationHooks: {},
        //@config {Object} 空对象，用于放置验证规则
        onSuccess: avalon.noop,
        //@config {Function} 空函数，单个验证成功时触发，this指向被验证元素this指向被验证元素，传参为一个对象数组
        onError: avalon.noop,
        //@config {Function} 空函数，单个验证失败时触发，this与传参情况同上
        onComplete: avalon.noop,
        //@config {Function} 空函数，单个验证无论成功与否都触发，this与传参情况同上
        onValidateAll: avalon.noop,
        //@config {Function} 空函数，整体验证后或调用了validateAll方法后触发
        onReset: avalon.noop,
        //@config {Function} 空函数，表单元素获取焦点时触发，this指向被验证元素，大家可以在这里清理className、value
        onResetAll: avalon.noop,
        //@config {Function} 空函数，当用户调用了resetAll后触发，
        validateInBlur: true,
        //@config {Boolean} true，在blur事件中进行验证,触发onSuccess, onError, onComplete回调
        validateInKeyup: true,
        //@config {Boolean} true，在keyup事件中进行验证,触发onSuccess, onError, onComplete回调
        validateAllInSubmit: true,
        //@config {Boolean} true，在submit事件中执行onValidateAll回调
        resetInFocus: true    //@config {Boolean} true，在focus事件中执行onReset回调
    }    //http://bootstrapvalidator.com/
         //https://github.com/rinh/jvalidator/blob/master/src/index.js
         //http://baike.baidu.com/view/2582.htm?fr=aladdin&qq-pf-to=pcqq.group
;
}
)();