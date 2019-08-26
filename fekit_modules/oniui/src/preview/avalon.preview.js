var avalon = require("avalon");

module.exports = (
function () {
    var widget = avalon.ui.preview = function (element, data, vmodels) {
            var options = data.previewOptions, fileChangeCallback;
            var file = options.fileInput;
            if (typeof file === 'string') {
                file = document.getElementById(file);
            }
            var isLegalFile = false;
            try {
                if (file.nodeType === 1 && file.tagName === 'INPUT' && file.type === 'file') {
                    isLegalFile = true;
                }
            } catch (e) {
            }
            if (isLegalFile === false) {
                throw new Error('fileInput\u5FC5\u987B\u662Finput[type=file]\u5143\u7D20\u8282\u70B9\u6216\u5176ID\u503C');
            }
            options.fileInput = file;
            var oneImageTypes = avalon.oneObject([
                    'image/gif',
                    'image/png',
                    'image/jpeg'
                ]);
            function addSettings(node, opts) {
                node.style.width = opts.width + 'px';
                node.style.height = opts.height + 'px';
                node.className = opts.className;
            }
            function appendImage(element, src, opts) {
                var image = new Image();
                element.appendChild(image);
                addSettings(image, opts);
                image.src = src;
            }
            var vmodel = avalon.define(data.previewId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'fileInput',
                        'widgetElement'
                    ];
                    vm.widgetElement = element;
                    vm.$init = function () {
                        var _vmodels = [vmodel].concat(vmodels);
                        fileChangeCallback = avalon.bind(file, 'change', function () {
                            var images = [];
                            var files = file.files || [];
                            for (var i = 0, el; el = files[i++];) {
                                if (oneImageTypes[el.type]) {
                                    images.push(el);
                                }
                            }
                            images.forEach(function (image) {
                                if (window.FileReader) {
                                    //方案1
                                    var reader = new FileReader();
                                    reader.onload = function (e) {
                                        appendImage(element, e.target.result, vm);
                                    };
                                    return reader.readAsDataURL(image);
                                }
                                var url;
                                if (window.createObjectURL !== void 0) {
                                    // basic
                                    url = window.createObjectURL(image);
                                } else if (window.URL !== void 0) {
                                    // mozilla IE11
                                    url = window.URL.createObjectURL(image);
                                } else if (window.webkitURL !== void 0) {
                                    // webkit or chrome
                                    url = window.webkitURL.createObjectURL(image);
                                }
                                if (typeof url === 'string') {
                                    return appendImage(element, url, vm);
                                }
                            });
                            if (images.length === 0 && document.selection) {
                                file.select();
                                var src = document.selection.createRange().text;
                                document.selection.empty();
                                var div = document.createElement('div');
                                element.appendChild(div);
                                addSettings(div, vm);
                                div.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)';
                                div.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
                            }
                        });
                        avalon.scan(element, _vmodels);
                        if (typeof options.onInit === 'function') {
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm.$remove = function () {
                        avalon.unbind(file, 'change', fileChangeCallback);
                        avalon.log('at $remove');
                    };
                });
            return vmodel;
        };
    widget.vertion = 1;
    widget.defaults = {
        width: 200,
        height: 160,
        className: ''
    };
    return avalon;
}
)();