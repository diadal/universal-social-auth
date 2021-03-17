const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "dist");

module.exports = {
  // entry: srcPath + "/index.ts",
  output: {
    path: libPath,
    filename: "index.js",
    // library: "UniversalSocialauth",
    // libraryTarget: "umd",
    // libraryExport: "default"
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
  new CopyPlugin({
      patterns: [
        { from: srcPath, to: libPath}
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
};
