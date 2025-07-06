const webpack = require('webpack');
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  entry: './src/main.ts',
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: { 
    extensions: ['.ts', '.js'],
    alias: {
      '@packages/common': join(__dirname, '..', 'common', 'src'),
      '@packages/game-server': join(__dirname, '..', 'game-server', 'src'),
      '@packages/realtime-server': join(__dirname, 'src'),
    }
  },
  output: {
    path: join(__dirname, '..', '..', 'dist', 'packages', 'ingame'),
    filename: 'main.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: join(__dirname, 'src', 'grpc', 'proto'), to: join('grpc', 'proto') },
      ],
    }),
  ],
}; 