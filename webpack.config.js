const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin= require('css-minimizer-webpack-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Book say this is already inlcuded via webpack
const TerserJSPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  watch: true,
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  // NOTE: Review, what does entry do?
  entry: {
    application: "./src/index.js",
    admin: "./src/admin"
  },
  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(__dirname, "build")
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html'
    }),
    new WebpackManifestPlugin(),
    // NOTE: Review, what does this plugin do again?
    // Cleans our output directory everytime we build
    new CleanWebpackPlugin(),
    //  NOTE: Review, why do we want to extract our css into separate files?
    //        What issues will this cause if we configure 'entry'?
    // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. 
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
    })
  ],
  module: {
    rules: [
      // Js rules
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // CSS rules
      {
        test: /\.css$/i,
        // LIFO, order matters
        // injects css into html <- loads css into js
        use: [
          // By using this plugin, we can extract the css after everything is loaded
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: { importLoaders: 1 }},
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                  plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['last 3 versions', 'ie >9']
                  }),
                ],
              }
            }
          },
        ],
      },
      // SASS rules
      {
        test: /\.scss$/i,
        // LIFO, order matters. 
        // Acts like a pipeline takes imported css and injects into index.html <- css-loader loads into js <- sass-loader prcoesses css
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: { importLoaders: 1 }},
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                  plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['last 3 versions', 'ie >9']
                  }),
                ],
              }
            }
          },
          'sass-loader'
        ],
      },
      // Images
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:7].[ext]'
            }
          },
          { loader: 'image-webpack-loader' }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new CSSMinimizerPlugin({}),
    ]
  }
}
