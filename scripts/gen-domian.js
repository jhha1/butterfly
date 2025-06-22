const fs = require('fs');
const path = require('path');

const domainName = process.argv[2];
if (!domainName) {
  console.error('도메인 이름을 입력하세요. 예: node gen-domain auth');
  process.exit(1);
}

const basePath = path.join(__dirname, '../../apps/game-server/src/domain', domainName);
const dtoPath = path.join(basePath, 'dto');
const entitiesPath = path.join(basePath, 'entities');

const pascal = domainName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const files = {
  [`${domainName}.controller.ts`]: `import { Controller } from '@nestjs/common';

@Controller('${domainName}')
export class ${pascal}Controller {}`,
  [`${domainName}.service.ts`]: `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascal}Service {}`,
  [`${domainName}.module.ts`]: `import { Module } from '@nestjs/common';
import { ${pascal}Service } from './${domainName}.service';
import { ${pascal}Controller } from './${domainName}.controller';

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

console.log(`'${domainName}' 도메인 스캐폴드 완료`);
