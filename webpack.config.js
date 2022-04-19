const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin= require('css-minimizer-webpack-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Book say this is already inlcuded via webpack
const TerserJSPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const mode = "development";

module.exports = {
  // watch: true,
  mode: mode,
  devtool: "eval-cheap-module-source-map",
  // NOTE: Review, what does entry do?
  entry: {
    application: "./src/javascripts/index.js",
    admin: "./src/javascripts/admin.js"
  },
  output: {
    filename: "[name]-[contenthash].js",
    path: path.resolve(__dirname, "build")
  },
  resolve: {
    alias: {
      CssFolder: path.resolve(__dirname, 'src/stylesheets/')
    }
  },
  // target: "web",
  devServer: {
    client: {
      overlay: true,
    },
    hot: true,
    port: 9000,
    // Webpack Dev server serves static files from memory. If a resource
    // is not found in memory, it will load from the file system at this directory
    // What does 'Content not from webpack served from .../build' mean?
    // Why does this work if I set the directory to a non-existent folder?
    // Contentbase was renamed to static in webpack 5
    // The point of static is to server static files, but what is it's relationship
    // to output.publicPath?
    //
    // Content not from webpack is served from '/home/armando/Desktop/workspace/learnWebpack/build' directory
    // Literally means: "Hey, in the event you look in a url path not where the webpack bundles are served from in memory, which
    // is the location specified in output.publicPath, we'll fall back to this fileServer that serves from this directory."
    // This file server's url location is the static.publicPath.
    // TLDR: This is a fall back if devServer.static.publicPath and output.publicPath don't match
    //       If they do match, output.publicPath takes precedence and we're serving from memory
    static: {
      // directory tells the server where to server the content from
      directory: path.resolve(__dirname, 'build'),
      // publicPath tells the server at which url to serve static.directory
      // publicPath: '/assests/'
    },
    // Interesting, when I set this to false, I don't see the error 
    // 'Content not from webpack served from .../build' 🤔
    // static: false,
    devMiddleware: {writeToDisk : true}
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // hmr: true, deprecated, webpack 5 automatically supports HMR
            }
          },
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // hmr: true, deprecated, webpack 5 automatically supports HMR
            }
          },
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
    ],
    // Why does this work?
    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/88
    // I don't get why it would instantiate twice if I have two entries
    // I need to fundamentally understand how entries work and how modules
    // are bundled for them
    runtimeChunk: 'single'
  },
}
