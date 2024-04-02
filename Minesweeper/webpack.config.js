// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const path = require('path');

// eslint-disable-next-line no-undef
module.exports = {
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  mode: "development",
  module: {
    rules: [
      {
        //Compile both .ts and .tsx files; the following line is regex
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname),
  },
  //If source files are changes, rebuild automatically
  watch: true
};