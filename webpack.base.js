const webpack = require('webpack');
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

/*
  webpack - nestJs 서버 번들링 + 빌드 과정 커스터마이징

  ts -> js 컴파일: ts-loader 나 babel-loader 등을 통해 .ts 코드를 한 번에 트랜스파일링
  모듈 번들링: 소스코드 및 라이브러리 번들링으로 배포 파일 수 줄이고 cold-start 시간 단축
  데코레이터 리플렉션 (reflect-metadata) 지원

  개발 편의 관련 
  핫 리로드 지원 (소스코드 변경시 서버재시작 없이 변경된 모듈만 감지 및 코드 재로드해서 변경분 적용)
  HMR 설정 (웹펙에서 제공하는 기능. 프론트엔드 개발중 변경시 페이지 전체 새로고침 없이 변경분만 교처(js, css) 상태를 유지한채로 UI 업데이트 - NestJS 서버에서 HMR 쓰면 서버 재시작 없이 변경분만 교체 적용됨)
  !! 근데 제대로 안됨. 플러그인이 주기적 폴링으로 변경사항 감지하고 그에따른 액션을 하는거라 아직 잘 모르겠음 

  프로덕션 모드에서 코드 난독화.최적화 가능 (이건 따로 알아봐야 함)

  대체품
  순수 tsc --build로 빌드 + tsconfig.build.json: 단일 파일 번들링 필요없고, 소스맵과 데코레이터만 동작하면 되는 경우
  esbuild / SWC 기반 번들러: 빌드 속도 빠른게 제일 중요할 경우. 속도가 빠르다고 함
  Nx esbuild: Nx Monorepo 쓰는경우, 모노리포 캐시최적화와 연동. 본인은 Nx 선택 안해서 패스.
*/

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'development',
  devtool: 'source-map', 
  output: {
    path: join(__dirname, 'dist'),
    filename: 'main.js',
    devtoolModuleFilenameTemplate: (info) =>
      'file:///' + info.absoluteResourcePath.replace(/\\/g, '/'),
  },
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
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: join(__dirname, 'dist', 'grpc', 'proto'), to: join('grpc', 'proto') },
      ],
    }),
  ],
};

// module.exports = (config, options) => {
//   // Source map 활성화 (디버깅용)
//   config.devtool = 'source-map';

//   config.plugins.push(
//     new CopyWebpackPlugin({
//       patterns: [
//         {
//           from: join(__dirname, 'packages', 'outgame', 'src', 'grpc', 'proto'),
//           to: join('packages', 'outgame', 'grpc', 'proto'),
//           // build 중 상대 경로 그대로 유지하려면
//           // to: 'grpc/proto'
//         },
//       ],
//     }),
//   );
  
//   return config;
// };
