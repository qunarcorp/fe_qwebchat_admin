'user strict';
const webpack = require('webpack');
const webpackConfig = require('./webpack.dev.config');

webpackConfig.plugins.unshift(
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    })
);

webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
        compress:true,
        mangle:false,
        beautify: true
        // sourceMap: true,
        // minimize: false
    })
);
module.exports = webpackConfig;
