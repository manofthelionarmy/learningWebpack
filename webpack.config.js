const path = require('path')
const  MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin= require('css-minimizer-webpack-plugin');

// Book say this is already inlcuded via webpack
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  watch: true,
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  entry: "./src/index.js",
  output: {
    filename: "application.js",
    path: path.resolve(__dirname, "build")
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'application.css',
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
