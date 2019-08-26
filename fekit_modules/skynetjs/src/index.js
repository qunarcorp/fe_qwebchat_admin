/*
* @Author: hollay
* @Date:   2015-06-29 17:36:13
* @Last Modified by:   haoliang.yan
* @Last Modified time: 2015-11-12 14:00:20
*/

'use strict'
var doc = document, win = window;
var QNRSK = win.QNRSK = {};

QNRSK.traceClick = true;

// Get Cookie
var uc_name = (function() {
    var re = /_q=U.([^;]*);/,
        m = doc.cookie.match(re);
    if (m && m.length) {
        return m[1];
    } else {
        return '';
    }
})();

//初始化变量 方法
var sk = {
    bid: '-1', // business id
    pid: '-1', // page id
    etype: 2, // event type, 0->enter page(pv); 1->leave page;2->click;3 other trace
    eptype: 0, // 页面类型，0 普通页面，1 入口页面
    ersp: 0,  // 0: 无跳转；1：有跳转
    uc_name: uc_name,
    sdk_type: 'touch',
    sdk_ver: '1'
};

function extend(target) {
    var args = Array.prototype.splice.call(arguments, 1),
        key;

    target = target || {};
    args.forEach(function(source) {
        for (key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });

    return target;
}

function getClickPosition(evt) {
    var e = evt || window.event,
        scrollX = document.documentElement.scrollLeft || document.body.scrollLeft,
        scrollY = document.documentElement.scrollTop || document.body.scrollTop,
        x = e.pageX || e.clientX + scrollX,
        y = e.pageY || e.clientY + scrollY;
    return {
        epos_w: x,
        epos_h: y
    };
}
var header = {
        refer: document.referrer || '-1',
        uri: window.location.href.toString(),
        res_w: screen.availWidth,
        res_h: screen.availHeight,
        http_host: window.location.host.toString(),
        sdk_ver: sk.sdk_ver,
        sdk_type: sk.sdk_type
    };

function manual(eid, options) {
    options = options || {};
    eid = eid || '';
    var params = {}, //
        text = {},
        pos = {},
        evt = options.evt || null,
        edata = options.edata || null,
        bid = ('bid' in options) ? options.bid : sk.bid,
        pid = ('pid' in options) ? options.pid : sk.pid,
        eptype = ('eptype' in options) ? options.eptype : sk.eptype,
        ersp = ('ersp' in options) ? options.ersp : sk.ersp,
        etype = ('etype' in options) ? options.etype : 3; // 未指定设置为3
    function add(key, value) {
        params[key] = value;
    }
    var img = new Image();
    add('t', sk.sdk_type);
    add('v', sk.sdk_ver);
    add('s', new Date().getTime());
    if (edata) {
        text['edata'] = JSON.stringify(edata);
    }
    text['etype'] = etype;
    text['ersp'] = ersp;
    text['eid'] = eid;
    text['c_time'] = new Date().getTime();
    if (evt) {
        pos = getClickPosition(evt);
    }
    add('text', JSON.stringify({
        header: header,
        event: extend({}, {
            bid: bid,
            pid: pid,
            eptype: eptype,
            uc_name: sk.uc_name
        }, text, pos)
    }));
    var s = [];
    for (var key in params) {
        s.push(key + '=' + encodeURIComponent(params[key]));
    }
    img.src = 'http://sk.test.com/w?' + s.join('&');
};

function clickHandler(e) {
    manual('', {
        evt: e,
        etype: 2
    });
}

function config(options) {
    var opts = options || {}, auto = false;

    ('traceClick' in opts) && (QNRSK.traceClick = opts.traceClick);
    ('auto' in opts) && (auto = !!opts.auto);

    ('bid' in opts) && (sk.bid = opts.bid);
    ('pid' in opts) && (sk.pid = opts.pid);
    ('eptype' in opts) && (sk.eptype = opts.eptype);

    if(auto) {
        manual('', {
            etype: 0
        });
    }

    if(QNRSK.traceClick) {
        if (document.addEventListener) {
            document.addEventListener('click', clickHandler, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', clickHandler);
        }
    }
}

win.QNRSK.manual = manual;
win.QNRSK.config = config;

module.exports = win.QNRSK;