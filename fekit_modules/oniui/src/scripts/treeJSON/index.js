//根据给出的目录及config配置文件，遍历文件，找到需要的文件

var config, path, underscore, expand, oniui_root, files, exports, dstPath, coverPath, fs, beautify;

fs = require('fs');
path = require('path');
underscore = require('underscore');
expand = require('glob-expand');
config = require('./config.js');
oniui_root = '/Users/gaga/github/oniui';
exports = [];
dstPath = path.join(__dirname, 'exports.js');
coverPath = 'doc/img';
files = expand({
    cwd: oniui_root,
    filter: 'isFile'
}, /.*\.(doc\.html)$/i);
beautify = require('js-beautify').js_beautify;

function filterHTML(source) {
    return !source ? "" : source.replace(/<\/?[^>]*>/g, "").replace(/[ | ]*\n/g, "\n").
        replace(/\n[\s| | ]*\r/g, "\n").replace(/ /ig, "")
}

function getContent(source) {
    return filterHTML(source? source[1]: '');
}

function fuckTheFile(filename, basename) {

    var resource, title, url, des;

    resource = fs.readFileSync(path.join(oniui_root, filename), {
        encoding: 'utf8'
    });
    url = oniui_root.split(path.sep);

    //title
    title = resource.match(/<title>([\s\S]*)<\/title>/i);

    resource = resource.replace(/<fieldset>([\s\S]*?)<\/fieldset>/i, function() {
        var content = arguments[1],
            r = content.match(/<p[\s\S]*?>[\s\S]*?<\/p>/ig),
            contents = '';

        if(r) {
            underscore.each(r, function(item) {
                contents += item.match(/<p[\s\S]*?>([\s\S]*?)<\/p>/i)[1];
            });
        } else {
            contents = content;
        }

        des = contents.replace(/\s*/, '');

        return '<fieldset>' + des + '</fieldset>';
    });

    fs.writeFileSync(path.join(oniui_root, filename), resource, {
        encoding: 'utf8'
    });

    return {
        name: basename,
        url: path.join(url[url.length - 1], filename),
        title: getContent(title),
        des: des,
        cover: path.join(coverPath, basename+'.gif')
    };
}

underscore.each(config, function(element) {
    underscore.each(element, function(item, i) {

        var basename = item.name,
            filename = path.join(basename, 'avalon.' + basename + '.doc.html');

        //coupledatepicker和daterangepicker在datepicker文件夹内，所以需要对其进行特殊处理
        if(basename === 'daterangepicker' || basename === 'coupledatepicker') {
            filename = path.join('datepicker', 'avalon.' + basename + '.doc.html')
        }

        console.log('[log]', filename, '开始转化.');
        if(files.indexOf(filename) > -1) {
            element[i] = fuckTheFile(filename, basename);
            console.log('[log]', filename, '转化完成.');
        }
    });
});

exports = [
    'define(function() {',
    'return ' + JSON.stringify(config),
    '});'
].join('');

fs.writeFileSync(path.join(dstPath), beautify( exports ), {
    encoding: 'utf8'
});


