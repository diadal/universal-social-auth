const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "lib");

module.exports = {
  entry: srcPath + "/index.ts",
  output: {
    path: libPath,
    filename: "index.js",
    library: "VQRCodeStyling",
    libraryTarget: "umd",
    libraryExport: "default"
  },
  module: {
    rules: [
     
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
  //  new UglifyJSPlugin({
  //       uglifyOptions: {
  //           compress: {
  //               drop_console: true
  //           }
  //       }
  //   })
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
};
