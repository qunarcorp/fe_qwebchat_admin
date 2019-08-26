var fs = require('fs'),
    path = require('path'),
    configPath = path.join(__dirname, 'config/exports.json'),
    jsPath = path.join(__dirname, 'src/index.js'),
    jsExport,
    cssPath = path.join(__dirname, 'src/index.css'),
    cssExport,
    nl = '\r\n';

fs.readFile(configPath, 'utf8', function(err, config) {
    jsExport = ['require("avalon");'];
    cssExport = ['require("./chameleon/oniui-common.css")'];
    config = JSON.parse(config);

    console.log("[log]", "转化开始");
    config.forEach(function(item) {
        var shimJs = shim(item, "js"),
            shimCss = shim(item, "css");
        shimJs && jsExport.push( shimJs );
        shimCss && cssExport.push( shimCss );
    });

    fs.writeFile(jsPath, jsExport.join(nl), function(err) {
        console.log("[log]", "js文件转化结束");
    });
    fs.writeFile(cssPath, cssExport.join(nl), function(err) {
        console.log("[log]", "css文件转化结束");
    });
});


/**
 * 适配导出文件的路径
 * @param item 组件名称
 * @param suffix 要导出的文件后缀，如js css
 * @returns {*}
 */
function shim(item, suffix) {
    var route;
    if(item === 'coupledatepicker' || item === 'daterangepicker') {
        route = 'require' + '("./datepicker/' + 'avalon.' + item + '.' + suffix + '")';
    } else if(item === 'promise' || item === 'validation' || item === 'mask' || item === 'json' || item === 'store' || item === 'hotkeys') {
        if(suffix === 'js') {
            route = 'require("./' + item + '/' + 'avalon.' + item + '.' + suffix + '")';
        }
    } else if(item === 'suggest') {
        route = 'require("./textbox/' + 'avalon.' + item + '.' + suffix + '")';
    }else {
        route = 'require("./' + item + '/' + 'avalon.' + item + '.' + suffix + '")';
    }
    return route;
}







  