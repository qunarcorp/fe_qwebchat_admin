var avalon = require("avalon");
require("../mmPromise/mmPromise");

module.exports = (
function () {
    if (!avalon.duplexHooks) {
        throw new Error('\u4F60\u7684\u7248\u672C\u5C11\u4E8Eavalon1.3.7\uFF0C\u4E0D\u652F\u6301ms-duplex2.0\uFF0C\u8BF7\u4F7F\u7528avalon.validation.old.js');
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
            cn: /^(?:0?1)[3458]\d{9}$/    //中国香港
                                      //   hk: /^(?:0?[1569])(?:\d{7}|\d{8}|\d{12})$/,
                                      //澳门
                                      // macao: /^6\d{7}$/,
                                      //台湾
                                      //  tw: /^(?:0?[679])(?:\d{7}|\d{8}|\d{10})$//*,
                                      //韩国
                                      //  kr:/^(?:0?[17])(?:\d{9}|\d{8})$/,
                                      //日本
                                      // jp:/^(?:0?[789])(?:\d{9}|\d{8})$/*/
        };
    /*
     * http://login.sdo.com/sdo/PRes/4in1_2/js/login.js
     * function isPhone(val){
     var gvPhoneRegExpress=new Array();
     gvPhoneRegExpress.push(/^14[57]\d{8}$/);
     gvPhoneRegExpress.push(/^15[012356789]\d{8}$/);
     gvPhoneRegExpress.push(/^13[0-9]\d{8}$/);
     gvPhoneRegExpress.push(/^18[012456789]\d{8}$/);
     var lvCellphoneIsOk=false;
     for (var i=0;i<gvPhoneRegExpress.length;i++){
     if(gvPhoneRegExpress[i].test(val)){
     lvCellphoneIsOk=true;
     break;
     }
     }
     return lvCellphoneIsOk;
     }
     其他手机号码正则
     /^(13\d\d|15[012356789]\d|18[012356789]\d|14[57]\d|17(0[059]|[78]\d))\d{7}$/
     /^(?:(?:13|18|15)[0-9]{9}|(?:147|170|176|177|178|199|196)[0-9]{8})$/; 
     
     */
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
                if (!vmValue.length) {
                    var has = false;
                } else {
                    has = true;
                    for (var i = 0, n = domValue.length; i < n; i++) {
                        var v = domValue[i];
                        if (vmValue.indexOf(v) === -1) {
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
    function fixEvent(event) {
        if (event.target) {
            return event;
        }
        var ret = {};
        for (var i in event) {
            ret[i] = event[i];
        }
        var target = ret.target = event.srcElement;
        if (event.type.indexOf('key') === 0) {
            ret.which = event.charCode != null ? event.charCode : event.keyCode;
        } else if (/mouse|click/.test(event.type)) {
            var doc = target.ownerDocument || document;
            var box = doc.compatMode === 'BackCompat' ? doc.body : doc.documentElement;
            ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
            ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
            ret.wheelDeltaY = ret.wheelDelta;
            ret.wheelDeltaX = 0;
        }
        ret.timeStamp = new Date() - 0;
        ret.originalEvent = event;
        ret.preventDefault = function () {
            //阻止默认行为
            event.returnValue = false;
        };
        ret.stopPropagation = function () {
            //阻止事件在DOM树中的传播
            event.cancelBubble = true;
        };
        return ret;
    }
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
             * @interface 验证当前元素下的所有非disabled元素
             * @param callback {Null|Function} 最后执行的回调，如果用户没传就使用vm.onValidateAll
             */
                    vm.validateAll = function (callback) {
                        var fn = typeof callback === 'function' ? callback : vm.onValidateAll;
                        var promise = vm.data.filter(function (data) {
                                var el = data.element;
                                return el && !el.disabled && vmodel.widgetElement.contains(el);
                            }).map(function (data) {
                                return vm.validate(data, true);
                            });
                        Promise.all(promise).then(function (array) {
                            var reasons = [];
                            for (var i = 0, el; el = array[i++];) {
                                reasons = reasons.concat(el);
                            }
                            if (vm.deduplicateInValidateAll) {
                                var uniq = {};
                                reasons = reasons.filter(function (data) {
                                    var el = data.element;
                                    var id = el.getAttribute('data-validation-id');
                                    if (!id) {
                                        id = setTimeout('1');
                                        el.setAttribute('data-validation-id', id);
                                    }
                                    if (uniq[id]) {
                                        return false;
                                    } else {
                                        uniq[id] = true;
                                        return true;
                                    }
                                });
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
             * @interface 验证单个元素对应的VM中的属性是否符合格式<br>此方法是框架自己调用
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
                                                message: elem.getAttribute('data-duplex-' + name + '-message') || elem.getAttribute('data-duplex-message') || hook.message,
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
                                        vm.validate(data, 0, fixEvent(e));
                                    });
                                }
                                if (vm.resetInFocus) {
                                    data.bound('focus', function (e) {
                                        vm.onReset.call(data.element, fixEvent(e), data);
                                    });
                                }
                                var array = vm.data.filter(function (el) {
                                        return el.element;
                                    });
                                avalon.Array.ensure(array, data);
                                vm.data = array;
                            }
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
        //@config {Function} 空函数，单个验证成功时触发，this指向被验证元素this指向被验证元素，传参为一个对象数组外加一个可能存在的事件对象
        onError: avalon.noop,
        //@config {Function} 空函数，单个验证失败时触发，this与传参情况同上
        onComplete: avalon.noop,
        //@config {Function} 空函数，单个验证无论成功与否都触发，this与传参情况同上
        onValidateAll: avalon.noop,
        //@config {Function} 空函数，整体验证后或调用了validateAll方法后触发；有了这东西你就不需要在form元素上ms-on-submit="submitForm"，直接将提交逻辑写在onValidateAll回调上
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
        resetInFocus: true,
        //@config {Boolean} true，在focus事件中执行onReset回调,
        deduplicateInValidateAll: false    //@config {Boolean} false，在validateAll回调中对reason数组根据元素节点进行去重
    }    //http://bootstrapvalidator.com/
         //https://github.com/rinh/jvalidator/blob/master/src/index.js
         //http://baike.baidu.com/view/2582.htm?fr=aladdin&qq-pf-to=pcqq.group
;
}
)();