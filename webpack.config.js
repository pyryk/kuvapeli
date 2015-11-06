var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require("path");

module.exports = {
    cache: true,
    debug: true,
    devtool: 'source-map',
    entry: {
        app: ["./src/app.js"]
    },
    output: {
        path: path.resolve(__dirname, "bin"),
        publicPath: "/bin/",
        path: "public",
        filename: "bundle.js"
    },
    module: {
        preLoaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ],
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader') }
        ]
    },
    postcss: [
        require('autoprefixer'),
        require('postcss-color-rebeccapurple'),
        require('postcss-nested')
    ],
    plugins: [
        new ExtractTextPlugin('style.css', { allChunks: true })
    ]
};