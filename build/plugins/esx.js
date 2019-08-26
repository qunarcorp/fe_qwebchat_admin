(function() {
  var babel, babelConfig;

  babel = require('babel-core');

  babelConfig = {
    babelrc: false,
    presets: [require("babel-preset-es2015"), require("babel-preset-react")]
  };

  exports.contentType = "javascript";

  exports.process = function(txt, path, module, cb) {
    var result;
    result = babel.transform(txt, babelConfig);
    try {
      return cb(null, result.code);
    } catch (err) {
      return cb(err);
    }
  };

}).call(this);