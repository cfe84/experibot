const path = require('path');

module.exports = {
  entry: './src/frontend/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist', 'application', 'scripts'),
    filename: 'index.js',
    library: "frontend"
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode: "development",
  optimization: {
    usedExports: true
  },
};