const fs = require('fs');
const path = require('path');

const server = process.argv[2];
const moduleName = process.argv[3];
if (!server || !moduleName) {
  console.error('대상 서버와 모듈 이름을 입력하세요. 예: node gen-module game-server auth');
  process.exit(1);
}
const isGrpc = process.argv[4] === 'grpc';

const basePath = isGrpc ? path.join(__dirname, `../packages/${server}/src/grpc/`, moduleName) : path.join(__dirname, `../packages/${server}/src/modules`, moduleName);
const dtoPath = path.join(basePath, 'dto');
const entitiesPath = path.join(basePath, 'entities');

const pascal = moduleName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const files = {
  [`${moduleName}.controller.ts`]: `import { Controller } from '@nestjs/common';

@Controller('${moduleName}')
export class ${pascal}Controller {}`,
  [`${moduleName}.service.ts`]: `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascal}Service {}`,
  [`${moduleName}.module.ts`]: `import { Module } from '@nestjs/common';
import { ${pascal}Service } from './${moduleName}.service';
import { ${pascal}Controller } from './${moduleName}.controller';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
})
export class ${pascal}Module {}`,
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`디렉터리 생성: ${dir}`);
  }
}

function createFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`파일 생성: ${filePath}`);
  }
}

ensureDir(basePath);
ensureDir(dtoPath);
ensureDir(entitiesPath);

Object.entries(files).forEach(([fileName, content]) => {
  createFile(path.join(basePath, fileName), content);
});

console.log(`'${moduleName}' 모듈 스캐폴드 완료`);
