const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { 
    vendor: './src/app/vendor.js',
    main: './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ]
};