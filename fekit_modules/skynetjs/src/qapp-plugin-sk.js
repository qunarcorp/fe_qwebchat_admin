/* 
 * @Author: hollay
 * @Date:   2015-07-30 18:01:14
 * @Last Modified by:   hollay
 * @Last Modified time: 2015-10-15 14:54:59
 * 用于统计
 */

'use strict';

var _ = QApp.util,
    QNRSK = require('./index.js');

var Config = {
    bid: '-1', // 缺省business_id
    traceClick: false,
    defaults: '',
    skOptions: {}
};

var defaultedata = null;

var sk = QApp.sk = (function() {
    var em = function() {};
    _.extend(em.prototype, _.CustEvent);
    return new em();
})();

QNRSK.config({
    autoPV: false,
    traceClick: false // 关闭原有的click检测
});

QApp.addPlugin('sk', {}, function(view) {
    view.sk = function(eid, options) {
        var vm = extractViewName(view.name),
            options = options || {},
            opt = Config.skOptions[vm];
        if (!opt) {
            // 发送请求的view未定义pid时，默认取首页pid
            opt = Config.defaultOption;
        }

        if (opt) {
            QNRSK.manual(eid, {
                etype: 3,
                bid: Config.bid,
                pid: opt.pid,
                eptype: opt.eptype || 0,
                edata: options
            });
        }
    };

    view.on('ready', function() {
        var vm = extractViewName(view.name),
            opt = Config.skOptions[vm],
            edata = view.param && view.param.edata,
            exportData = {};

        defaultedata && (_.extend(exportData, defaultedata));
        edata && (_.extend(exportData, edata));

        if (opt) {
            // PV 
            QNRSK.manual('', {
                etype: 0,
                bid: Config.bid,
                pid: opt.pid,
                eptype: opt.eptype || 0,
                edata: exportData
            });
        }
    });
});

QApp.setGlobalPlugins('sk');

sk.config = function(params) {
    _.extend(Config, params);

    if (Config.traceClick) {
        if (document.addEventListener) {
            document.addEventListener('click', clickHandler, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', clickHandler);
        }
    }

    if (Config.edata) {
        defaultedata = Config.edata;
    }

    Config.defaultOption = Config.skOptions[Config['defaults']];
};

function extractViewName(name) {
    return name.replace(/:.+/, '');
}

function clickHandler(e) {
    var pid = '-1', viewName, vp;

    try {
        viewName = QApp.router.getCurViewName();
        vp = Config.skOptions[viewName];
        if(vp) {
            pid = vp.pid;
        } else {
            pid = Config.defaultOption.pid;
        }
    } catch(e) {}

    QNRSK.manual('', {
        evt: e,
        etype: 2,
        bid: Config.bid,
        pid: pid,
        eptype: 0
    });
}