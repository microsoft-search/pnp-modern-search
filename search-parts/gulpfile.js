'use strict';

const os = require('os');
const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const build = require('@microsoft/sp-build-web');
const log = require('@microsoft/gulp-core-build').log;
const bundleAnalyzer = require('webpack-bundle-analyzer');
const colors = require("colors");
const fs = require("fs");

build.addSuppression(/^Warning - \[sass\].*$/);

const envCheck = build.subTask('environmentCheck', (gulp, config, done) => {
    let threading = false;
    if (!config.production) {
        //https://spblog.net/post/2019/09/18/spfx-overclockers-or-how-to-significantly-improve-your-sharepoint-framework-build-performance#h_296972879501568737888136
        log(`[${colors.cyan('configure-webpack')}] Turning off ${colors.cyan('tslint')}...`);
        build.tslintCmd.enabled = false;
    } else {
        threading = true;
    }
    build.configureWebpack.mergeConfig({
        additionalConfiguration: (generatedConfiguration) => {

            if (threading && generatedConfiguration.optimization) {
                log(`[${colors.cyan('configure-webpack')}] Enabled minimizer threading...`)
                generatedConfiguration.optimization.minimizer[0].options.parallel = true;
            }

            /********************************************************************************************
             * Adds an alias for handlebars in order to avoid errors while gulping the project
             * https://github.com/wycats/handlebars.js/issues/1174
             * Adds a loader and a node setting for webpacking the handlebars-helpers correctly
             * https://github.com/helpers/handlebars-helpers/issues/263
             ********************************************************************************************/
            generatedConfiguration.resolve.alias = { handlebars: 'handlebars/dist/handlebars.min.js' };

            generatedConfiguration.node = {
                fs: 'empty'
            }

            generatedConfiguration.module.rules.push({
                test: /utils\.js$/,
                loader: 'unlazy-loader',
                include: [
                    /node_modules/,
                ]
            }, {
                // Skip logging helpers as they break on webpack and are not needed
                test: /index.js$/,
                loader: 'string-replace-loader',
                include: [
                    /handlebars-helpers/,
                ],
                options: {
                    search: '(logging|markdown): require.*?,',
                    replace: '',
                    flags: 'g'
                }
            });

            if (config.production) {
                log(`[${colors.cyan('configure-webpack')}] Adding plugin ${colors.cyan('BundleAnalyzerPlugin')}...`);
                const lastDirName = path.basename(__dirname);
                const dropPath = path.join(__dirname, 'temp', 'stats');
                generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
                    openAnalyzer: false,
                    analyzerMode: 'static',
                    reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
                    generateStatsFile: false,
                    logLevel: 'error'
                }));
            }

            return generatedConfiguration;
        }
    });

    done();
});
build.rig.addPreBuildTask(envCheck);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function() {
    var result = getTasks.call(build.rig);

    result.set('serve', result.get('serve-deprecated'));

    return result;
};

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));