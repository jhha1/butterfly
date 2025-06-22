const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (config, options) => {
  // config.plugins 배열 뒤에 복사 플러그인 추가
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: join(__dirname, 'apps', 'game-server', 'src', 'grpc', 'proto'),
          to: join('apps', 'game-server', 'grpc', 'proto'),
          // build 중 상대 경로 그대로 유지하려면
          // to: 'grpc/proto'
        },
      ],
    }),
  );

  return config;
};
