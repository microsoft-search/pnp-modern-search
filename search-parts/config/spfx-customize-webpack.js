'use strict';

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
 * Customize the SPFx webpack configuration.
 *
 * Called by the customize-spfx-webpack-configuration-plugin in the SPFx rig.
 * Mutate webpackConfig in place — no return value needed.
 *
 * @param {import('webpack').Configuration} webpackConfig
 * @param {object} taskSession - taskSession.parameters.production = boolean
 * @param {object} heftConfiguration - heftConfiguration.buildFolderPath = project root
 * @param {typeof import('webpack')} webpack - The webpack module
 */
module.exports = function (webpackConfig, taskSession, heftConfiguration, webpack) {
    const projectRoot = heftConfiguration.buildFolderPath;

    // ─── resolve.alias ─────────────────────────────────────────────────────────
    webpackConfig.resolve = webpackConfig.resolve || {};
    webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        handlebars: 'handlebars/dist/handlebars.min.js',
        process: 'process/browser',
        // Force ALL imports of adaptive-expressions (including from adaptivecards-templating)
        // to use the main entry (index.js) instead of the browser field.
        'adaptive-expressions': path.resolve(projectRoot, 'node_modules/adaptive-expressions/lib/index.js'),
    };

    // ─── resolve.fallback (Node polyfills for browser) ─────────────────────────
    webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        querystring: require.resolve('querystring-es3'),
        os: require.resolve('os-browserify/browser'),
        assert: require.resolve('assert/'),
        fs: false,
    };

    // ─── Remove the default html rule ──────────────────────────────────────────
    webpackConfig.module.rules = webpackConfig.module.rules.filter((rule) => {
        return !(rule.test && rule.test.toString() === '/\\.html$/');
    });

    // ─── Custom module rules ───────────────────────────────────────────────────
    webpackConfig.module.rules.push(
        // Babel-loader for lit / @lit / lit-html (transpile optional chaining etc.)
        {
            test: /\.js$/,
            include: [/lit/, /@lit/, /lit-html/],
            use: {
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-transform-optional-chaining',
                        '@babel/plugin-transform-nullish-coalescing-operator',
                        '@babel/plugin-transform-logical-assignment-operators',
                    ],
                },
            },
        },
        // Ignore HoverReactionsBar from spfx-controls-react (unused, bloats bundle)
        {
            test: /index\.js$/,
            include: [/spfx-controls-react[/\\]lib[/\\]controls[/\\]HoverReactionsBar/],
            loader: 'ignore-loader',
        },
        // html-loader for .html files (handlebars templates) without minification
        {
            test: /\.html$/,
            loader: 'html-loader',
            options: {
                minimize: false,
            },
        }
    );

    // ─── optimization: disable vendor chunk splitting ──────────────────────────
    webpackConfig.optimization = webpackConfig.optimization || {};
    webpackConfig.optimization.splitChunks = {
        cacheGroups: { vendors: false },
    };

    // ─── Plugins ───────────────────────────────────────────────────────────────
    webpackConfig.plugins = webpackConfig.plugins || [];

    // Ignore dayjs locale files that are not dynamically imported
    // (dayjs is much smaller than moment, but this keeps the main chunk lean)
    webpackConfig.plugins.push(
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\.\/locale$/,
            contextRegExp: /dayjs$/,
        })
    );

    // Provide process/browser globally
    webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    );

    // Bundle analyzer for production builds
    if (taskSession.parameters.production) {
        const lastDirName = path.basename(projectRoot);
        const dropPath = path.join(projectRoot, 'temp', 'stats');
        webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
                openAnalyzer: false,
                analyzerMode: 'static',
                reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
                generateStatsFile: false,
                logLevel: 'error',
            })
        );
    }
};
