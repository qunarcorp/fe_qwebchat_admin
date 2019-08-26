/**使用方式
 * var portArr = [
	{
	    inputId: "cruiseDeparture",//输入框的id
	    hiddenInputId: "cruise_departure",//隐藏域 用于传递参数
	    url : Cfg.api.depatureUrl,//suggest的接口
	    preload : true//是否预加载数据到$.dataModule里面
	}

	$.suggestModule.init(portArr);
 */

require('jsCommon/jquery.qsuggest.js');

var suggestModule = {
    init: function(data) {
        var me = this;
        data = data || [];

        $.each(data, function(i, item) {
            var $el = $("#" + item.inputId);
            if (!$el.length) {
                return;
            }

            var $hiddenEl = $("#" + item.hiddenInputId);
            var value = $hiddenEl.val();

            //by t.z
            //hiddenValType,如果为string:说明是id+"_@_"+name,如果为number,则为id值
            var hiddenValType = item.hiddenValType || "string";
            //这个属性在校验当前控件是否选择了suggest的时候会用到

            if (item.preload) {
                if (value) {
                    var result = [];
                    value = value.split(",") || [];
                    for (var i = 0; i < value.length; i++) {
                        var dataItem = value[i].split("_@_");
                        result.push({
                            id: dataItem[0],
                            name: dataItem[1]
                        })
                    }
                    $.dataModule.save(result, $el.attr("id"));
                }
            }

            me.suggest($el, {
                hidden: $hiddenEl,
                hiddenValType: hiddenValType,
                url: item.url,
                key: item.key || "result"
            });
        });
    },
    suggest: function($el, options) {
        options = options || {};

        $el.qsuggest({
            ajax: {
                url: options.url || '',
                dataType: String(options.url).indexOf("http") >" + QNR.i18n(" -1 ? ")jsonp" : "json",
                cache: false
            },
            delay: 100,
            receiveErrorMsg: true,
            reader: function(data) {
                if(!data.ret && data.message) {
                    alert(data.message);
                    return
                }
                
                var ret = [],
                    result;
                try {
                    result = data[options.key] || data.data[options.key];
                } catch (e) {
                    result = [];
                }
                if (data && result) {
                    for (var i = 0, len = result.length; i < len; i += 1) {
                        var o = {};
                        o["id"] = result[i].id;
                        o["display"] = result[i].suggestInfo || result[i].c;
                        o["name"] = result[i].suggestInfo || result[i].fullarrive || result[i].display;
                        o.type = result[i].type;
                        ret.push(o);
                    }
                    $.dataModule.save(ret, $el.attr("id"));
                }
                return ret;
            },
            on: {
                "q-suggest-user-action": function(a, b, c) {
                    $(this).data("data", c);
                    if (options.hiddenValType === "string") {
                        options.hidden && options.hidden.val(c.id + "_@_" + c.name);
                    };
                    if (options.hiddenValType === "number") {
                        options.hidden && options.hidden.val(c.id);
                    };
                    if (options.hiddenValType === "name") {
                        options.hidden && options.hidden.val(c.name);
                    };
                }
            }
        });
    }
}
$.suggestModule = function(arr) {
    suggestModule.init(arr);
};