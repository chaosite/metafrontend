const webpack = require('webpack');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = (env, argv) => ({
    name: 'metafrontend',
    mode: argv.mode || 'development',
    entry: './index.ts',
    devtool: argv.mode !== 'production' ? "inline-source-map" : undefined,
    stats: {
        hash: false, version: false, modules: false  // reduce verbosity
    },
    output: {
        filename: 'index.js',
        path: `${__dirname}/public`
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/i,  /* Vue.js has some */
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext][query]'
                }
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.wasm$/,
                loader: 'file-loader',
                type: 'javascript/auto'
            }
        ],
    },
    node: {
        global: false
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        fallback: {
            path: require.resolve("path-browserify"),
            stream: require.resolve("stream-browserify"),
            crypto: require.resolve("crypto-browserify")
        }
    },
    externals: {
        fs: 'commonjs2 fs'
    },
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        futureDefaults: true,
        outputModule: true
    },
    plugins: [// new VueLoaderPlugin(),
              new webpack.DefinePlugin({ 'process': {browser: true, env: {}} }),
              new webpack.ProvidePlugin({ 'Buffer': 'buffer' }),
              new webpack.IgnorePlugin({resourceRegExp: /\/applets\/helpers$/})]
});
