/*
 * @Description:  webpack2 配置
 * @Author: kewei.wang
 * @Date: 2017-05-03 16:55:54
 * @Last Modified by: kewei.wang
 * @Last Modified time: 2017-05-16 09:27:55
 */

'use strict';
const webpack = require('webpack');

const path = require('path');

const scriptRoot = __dirname + '/src/scripts/';
const dashboardRoot = scriptRoot + 'touch/page/dashboard/';
const touchLib = scriptRoot + 'touch/lib/';
const touchUtil = scriptRoot + 'touch/utils/';
const dashboardCommon = dashboardRoot + 'common/';
const touchCommon = scriptRoot + 'touch/common/';

module.exports = {

    entry: {
        index: dashboardRoot + 'index/app.jsx',
        detail: ['babel-polyfill', dashboardRoot + 'detail/app.jsx'],
        qchat: ['babel-polyfill', dashboardRoot + 'qchat/app.jsx']
    },
    output: {
        path: __dirname + '/src/scripts/touch/dist/dashboard/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules', 'fekit_modules'],
        alias: {
            dashboardRoot: path.resolve(dashboardRoot),
            touchLib: path.resolve(touchLib),
            touchUtil: path.resolve(touchUtil),
            touchCommon: path.resolve(touchCommon),
            dashboardCommon: path.resolve(dashboardCommon)
        }
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.CommonsChunkPlugin('common')
    ],
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'stage-0', 'react']
                }
            }
        }, {
            test: /\.string$/,
            use: 'string-loader'
        }, {
            test: /\.mustache$/,
            use: 'mustache-loader'
        }]
    }
};