var webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require("path");

var env = process.env.NODE_ENV;
var prod = env && env.toLowerCase() === 'prod';

var prodPlugins = [
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
]

var definePlugin = new webpack.DefinePlugin({
  __PROD__: prod
});

module.exports = {
    cache: true,
    debug: true,
    devtool: 'source-map',
    entry: {
        app: ["./src/app.js"]
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        preLoaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ],
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel", query: {cacheDirectory: true, presets: ['es2015']}},
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader') },
            { test: /\.sw.js$/, loader: "serviceworker"}
        ]
    },
    postcss: [
        require('autoprefixer'),
        require('postcss-color-rebeccapurple'),
        require('postcss-nested')
    ],
    plugins: [
        definePlugin,
        new ExtractTextPlugin('style.css', { allChunks: true }),
    ].concat(prod ? prodPlugins : [])
};