// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const fs = require("fs");
const yaml = require("yaml");
const _ = require("lodash");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV == "production";
const pageRoot = "src/common.bundles/";

const commonData = yaml.parse(fs.readFileSync("./src/data/common.yml", "utf8"));
const contentData = require("./src/data/content.json");
const templateUtils = require("./src/utils/template");

const templateParameters = {
  ...commonData,
  content: contentData,
  util: templateUtils
};

function getPages(root, ext) {
  const files = fs.readdirSync(root, {
    encoding: "utf-8",
    withFileTypes: true
  });

  return files
    .filter(entry => entry.isFile())
    .filter(entry => path.extname(entry.name) === ("."+ext))
    .map(entry => entry.name);
}

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    open: true,
    host: "localhost",
    watchFiles: ["*.html"],
    hot: true
  },
  plugins: [
    ...getPages(pageRoot, 'html').map(page => new HtmlWebpackPlugin({
      template: pageRoot + page,
      inject: "body",
      filename: page,
      templateParameters
    })),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.ejs$/i,
        loader: "html-loader",
        options: {
          preprocessor: (content, loaderContext) => {
            let result;

            try {
              result = _.template(content)(templateParameters);
            } catch (error) {
              loaderContext.emitError(error);

              return content;
            }

            return result;
          },
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "postcss-loader", "resolve-url-loader", {
          loader: "sass-loader",
          options: {
            sourceMap: true,
            sassOptions: {
              includePaths: ["src/scss"]
            }
          }
        }],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  return config;
};
