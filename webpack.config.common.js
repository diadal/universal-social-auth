const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "dist");

const mainConfig = {
  entry: srcPath + "/index.ts",
  output: {
    path: libPath,
    filename: "index.js",
    library: "UniversalSocialauth",
    libraryTarget: "umd" 
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
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
};

const providerConfig = {
  entry: srcPath + "/providers/index.ts",
  output: {
    path: libPath + '/providers',
    filename: 'index.js',
    library: "Providers",
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
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
};




module.exports = [mainConfig, providerConfig] ;
