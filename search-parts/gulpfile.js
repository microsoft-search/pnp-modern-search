'use strict';

const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const build = require('@microsoft/sp-build-web');
const bundleAnalyzer = require('webpack-bundle-analyzer');
const log = require('fancy-log');
const fs = require('fs');
const colors = require('colors');

const readJson = (path, cb) => {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err)
            log.error(err)
        else
            cb(null, JSON.parse(data))
    });
}

build.addSuppression(/^Warning - \[sass\].*$/);

// Retrieve the current build config and check if there is a `warnoff` flag set
const crntConfig = build.getConfig();
const warningLevel = crntConfig.args["warnoff"];

// Extend the SPFx build rig, and overwrite the `shouldWarningsFailBuild` property
if (warningLevel) {
    class CustomSPWebBuildRig extends build.SPWebBuildRig {
        setupSharedConfig() {
            build.log("IMPORTANT: Warnings will not fail the build.")
            build.mergeConfig({
                shouldWarningsFailBuild: false
            });
            super.setupSharedConfig();
        }
    }

    build.rig = new CustomSPWebBuildRig();
}

const envCheck = build.subTask('environmentCheck', (gulp, config, done) => {

    if (!config.production) {
        //https://spblog.net/post/2019/09/18/spfx-overclockers-or-how-to-significantly-improve-your-sharepoint-framework-build-performance#h_296972879501568737888136
        log(`[${colors.cyan('configure-webpack')}] Turning off ${colors.cyan('tslint')}...`);
        build.tslintCmd.enabled = false;
    }

    build.configureWebpack.mergeConfig({
        additionalConfiguration: (generatedConfiguration) => {

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

            generatedConfiguration.optimization.splitChunks.cacheGroups = { vendors: false };

            // pack each moment.js locale individually to optimize bundle
            generatedConfiguration.plugins.push(
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            );            

            if (config.production) {
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

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
    var result = getTasks.call(build.rig);

    result.set('serve', result.get('serve-deprecated'));

    return result;
};

build.initialize(require('gulp'));

const findFilesByExt = (base, ext, files, result) => {
    files = files || fs.readdirSync(base)
    result = result || []

    files.forEach(
        function (file) {
            var newbase = path.join(base, file)
            if (fs.statSync(newbase).isDirectory()) {
                result = findFilesByExt(newbase, ext, fs.readdirSync(newbase), result)
            } else {
                if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
                    result.push(newbase)
                }
            }
        }
    );
    return result
}

gulp.task('update-version', async () => {

    // List all manifest files
    const manifestFiles = findFilesByExt('./src', 'manifest.json');

    const semver = require('semver')
    const versionArgIdx = process.argv.indexOf('--value');
    const newVersionNumber = semver.valid(process.argv[versionArgIdx + 1]);

    if (versionArgIdx !== -1 && newVersionNumber) {

        // Update version in the package-solution
        const pkgSolutionFilePath = './config/package-solution.json';

        readJson(pkgSolutionFilePath, (err, pkgSolution) => {
            log.info('Old package-solution.json version:\t' + pkgSolution.solution.version);
            const pkgVersion = `${semver.major(newVersionNumber)}.${semver.minor(newVersionNumber)}.${semver.patch(newVersionNumber)}.0`;
            pkgSolution.solution.version = pkgVersion
            log.info('New package-solution.json version:\t' + pkgVersion);
            fs.writeFile(pkgSolutionFilePath, JSON.stringify(pkgSolution, null, 4), (error) => { });
        });

        // Updated version in Web Part manifests
        manifestFiles.forEach((manifestFile) => {
            readJson(`./${manifestFile}`, (err, manifest) => {

                log.info(`Updating manifest file: "./${manifestFile}"`);

                log.info('Old manifestFile version:\t' + manifest.version);
                const wpVersion = `${semver.major(newVersionNumber)}.${semver.minor(newVersionNumber)}.${semver.patch(newVersionNumber)}`;
                manifest.version = wpVersion;
                log.info('New manifestFile version:\t' + wpVersion);
                fs.writeFile(manifestFile, JSON.stringify(manifest, null, 4), (error) => { });
            });
        });
    } else {
        log.error(`The provided version ${process.argv[versionArgIdx + 1]} is not a valid SemVer version`);
    }
});

gulp.task('update-package-name', async () => {

    const pkgSolutionFilePath = './config/package-solution.json';

    const fileNameArg = process.argv.indexOf('--name');
    const fileName = process.argv[fileNameArg + 1];

    if (fileNameArg !== -1 && fileName) {
        readJson(pkgSolutionFilePath, (err, pkgSolution) => {
            const currentPackageName = path.basename(pkgSolution.paths.zippedPackage, '.sppkg');
            log.info(`Rename ${currentPackageName}.sppkg to ${fileName}.sppkg`);
            pkgSolution.paths.zippedPackage = pkgSolution.paths.zippedPackage.replace(path.basename(pkgSolution.paths.zippedPackage, '.sppkg'), fileName);
            fs.writeFile(pkgSolutionFilePath, JSON.stringify(pkgSolution, null, 4), (error) => { });
        });
    } else {
        log.error(`Error: wrong parameters`);
    }
});