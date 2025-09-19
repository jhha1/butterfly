
const { join } = require('node:path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const config = {
  mode: 'production',          // dev 디버깅 시 'development'로
  target: 'node',
  context: __dirname,          // 앱 디렉토리 기준
  entry: join(__dirname, 'src/main.ts'),
  output: {
    path: join(__dirname, 'dist'),
    filename: 'main.js',
    // VSCode 브포 바인딩 안정화
    devtoolModuleFilenameTemplate: (info) =>
      'file:///' + info.absoluteResourcePath.replace(/\\/g, '/'),
  },
  resolve: { 
    extensions: ['.ts', '.js']
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: { 
            configFile: join(__dirname, 'tsconfig.app.json'),
          }
        }
      }
    ]
  },
  optimization: { minimize: true }, // 프로덕션
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: join(__dirname, 'src', 'grpc', 'proto'), to: join('grpc', 'proto') },
      ],
    }),
  ],
};

module.exports = config;