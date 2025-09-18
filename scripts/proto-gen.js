const fs = require('fs');
const path = require('path');

// proto 파일 파싱 함수
function parseProtoFile(protoPath) {
  const content = fs.readFileSync(protoPath, 'utf8');
  const lines = content.split('\n');
  
  let serviceName = '';
  let methods = [];
  let messages = [];
  let enums = [];
  
  let currentMessage = null;
  let currentEnum = null;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 서비스 파싱
    if (line.match(/^service\s+(\w+)\s*\{/)) {
      serviceName = line.match(/^service\s+(\w+)\s*\{/)[1];
      continue;
    }
    
    // RPC 메서드 파싱
    if (line.match(/^\s*rpc\s+(\w+)\s*\((.+?)\)\s*returns\s*\((.+?)\)/)) {
      const match = line.match(/^\s*rpc\s+(\w+)\s*\((.+?)\)\s*returns\s*\((.+?)\)/);
      methods.push({
        name: match[1],
        requestType: match[2],
        responseType: match[3]
      });
      continue;
    }
    
    // 메시지 시작
    if (line.match(/^message\s+(\w+)\s*\{/)) {
      currentMessage = {
        name: line.match(/^message\s+(\w+)\s*\{/)[1],
        fields: []
      };
      braceCount = 1;
      continue;
    }
    
    // 열거형 시작
    if (line.match(/^enum\s+(\w+)\s*\{/)) {
      currentEnum = {
        name: line.match(/^enum\s+(\w+)\s*\{/)[1],
        values: []
      };
      braceCount = 1;
      continue;
    }
    
    // 중괄호 카운트
    if (line.includes('{')) braceCount++;
    if (line.includes('}')) braceCount--;
    
    // 메시지 필드 파싱
    if (currentMessage && braceCount === 1) {
      const fieldMatch = line.match(/^\s*(.+?)\s+(\w+)\s*=\s*(\d+);/);
      if (fieldMatch) {
        let fieldType = fieldMatch[1].trim();
        
        // optional 키워드 제거
        if (fieldType.startsWith('optional ')) {
          fieldType = fieldType.replace('optional ', '');
        }
        
        currentMessage.fields.push({
          type: fieldType,
          name: fieldMatch[2],
          number: parseInt(fieldMatch[3])
        });
      }
    }
    
    // 열거형 값 파싱
    if (currentEnum && braceCount === 1) {
      const enumMatch = line.match(/^\s*(\w+)\s*=\s*(\d+);/);
      if (enumMatch) {
        currentEnum.values.push({
          name: enumMatch[1],
          value: parseInt(enumMatch[2])
        });
      }
    }
    
    // 메시지/열거형 종료
    if (braceCount === 0 && currentMessage) {
      messages.push(currentMessage);
      currentMessage = null;
    }
    
    if (braceCount === 0 && currentEnum) {
      enums.push(currentEnum);
      currentEnum = null;
    }
  }
  
  return { serviceName, methods, messages, enums };
}

// TypeScript 타입 매핑
function mapProtoTypeToTS(protoType) {
  const typeMap = {
    'string': 'string',
    'int32': 'number',
    'uint32': 'number',
    'int64': 'number',
    'uint64': 'number',
    'double': 'number',
    'float': 'number',
    'bool': 'boolean',
    'bytes': 'Uint8Array',
    'google.protobuf.Empty': '{}'
  };
  
  if (typeMap[protoType]) {
    return typeMap[protoType];
  }
  
  // repeated 타입 처리
  if (protoType.startsWith('repeated ')) {
    const innerType = protoType.replace('repeated ', '');
    return `${mapProtoTypeToTS(innerType)}[]`;
  }
  
  return protoType; // 커스텀 타입은 그대로 반환
}

// DTO 생성
function generateDto(message, moduleName, allMessages) {
  const className = `${message.name}Dto`;
  const fields = message.fields.map(field => 
    `  ${field.name}!: ${mapProtoTypeToTS(field.type)};`
  ).join('\n');
  
  // 필요한 import 문 생성
  const imports = [];
  message.fields.forEach(field => {
    let fieldType = field.type;
    
    // repeated 타입에서 내부 타입 추출
    if (fieldType.startsWith('repeated ')) {
      fieldType = fieldType.replace('repeated ', '');
    }
    
    // 커스텀 타입인 경우 import 추가
    if (!['string', 'number', 'boolean', 'Uint8Array', '{}'].includes(mapProtoTypeToTS(fieldType))) {
      if (fieldType === 'ResponseStatus') {
        // ResponseStatus는 기본 타입으로 추가하지 않음 (base.proto에서 정의됨)
      } else if (allMessages.find(m => m.name === fieldType)) {
        imports.push(`import { ${fieldType}Dto } from './${fieldType.toLowerCase()}.dto';`);
      }
    }
  });
  
  const uniqueImports = [...new Set(imports)];
  const importSection = uniqueImports.length > 0 ? uniqueImports.join('\n') + '\n\n' : '';
  
  return `${importSection}export class ${className} {
${fields}
}`;
}

// enum 생성
function generateEnum(enumData, moduleName) {
  const enumName = enumData.name;
  const values = enumData.values.map(value => 
    `  ${value.name} = ${value.value},`
  ).join('\n');
  
  return `export enum ${enumName} {
${values}
}

export const ${enumName.toUpperCase()}_MAP = new Map<number, boolean>(
  Object.values(${enumName})
    .filter((v): v is ${enumName} => typeof v === 'number')
    .map((num) => [num, true])
);`;
}

// 컨트롤러 생성/업데이트
function updateController(serviceName, methods, moduleName, moduleDir) {
  const controllerName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller`;
  const serviceMemberName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service`;
  const controllerPath = path.join(moduleDir, `${moduleName}.controller.ts`);
  
  const imports = [
    `import { Controller } from '@nestjs/common';`,
    `import { GrpcMethod } from '@nestjs/microservices';`,
    `import { ${serviceMemberName} } from './${moduleName}.service';`,
  ];
  
  // DTO imports 생성
  const dtoImports = [];
  methods.forEach(method => {
    if (method.requestType !== 'google.protobuf.Empty') {
      dtoImports.push(`import { ${method.requestType}Dto } from './dto/${method.requestType.toLowerCase()}.dto';`);
    }
    if (method.responseType !== 'google.protobuf.Empty') {
      dtoImports.push(`import { ${method.responseType}Dto } from './dto/${method.responseType.toLowerCase()}.dto';`);
    }
  });
  
  const uniqueDtoImports = [...new Set(dtoImports)];
  
  const methodsCode = methods.map(method => {
    const methodName = method.name.charAt(0).toLowerCase() + method.name.slice(1);
    const requestType = method.requestType === 'google.protobuf.Empty' ? '{}' : `${method.requestType}Dto`;
    const responseType = method.responseType === 'google.protobuf.Empty' ? '{}' : `${method.responseType}Dto`;
    
    return `    @GrpcMethod('${serviceName}', '${method.name}')
  async ${methodName}(request: ${requestType}): Promise<${responseType}> {
    return this.${moduleName}Service.${methodName}(request);
  }`;
  }).join('\n\n');
  
  const controllerContent = `${imports.join('\n')}
${uniqueDtoImports.join('\n')}

@Controller()
export class ${controllerName} {
  constructor(private readonly ${moduleName}Service: ${serviceMemberName}) {}

${methodsCode}
}`;

  // 기존 컨트롤러가 있다면 백업
  if (fs.existsSync(controllerPath)) {
    const backupPath = `${controllerPath}.backup.${Date.now()}`;
    fs.copyFileSync(controllerPath, backupPath);
    console.log(`📄 Backed up existing controller to: ${backupPath}`);
  }

  fs.writeFileSync(controllerPath, controllerContent);
  console.log(`✅ Updated Controller: ${controllerPath}`);
}

// 서비스 생성/업데이트
function updateService(serviceName, methods, moduleName, moduleDir) {
  const serviceMemberName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service`;
  const servicePath = path.join(moduleDir, `${moduleName}.service.ts`);
  
  const imports = [
    `import { Injectable } from '@nestjs/common';`
  ];
  
  // DTO imports 생성
  const dtoImports = [];
  methods.forEach(method => {
    if (method.requestType !== 'google.protobuf.Empty') {
      dtoImports.push(`import { ${method.requestType}Dto } from './dto/${method.requestType.toLowerCase()}.dto';`);
    }
    if (method.responseType !== 'google.protobuf.Empty') {
      dtoImports.push(`import { ${method.responseType}Dto } from './dto/${method.responseType.toLowerCase()}.dto';`);
    }
  });
  
  const uniqueDtoImports = [...new Set(dtoImports)];
  
  let existingMethods = [];
  
  // 기존 서비스 파일이 있다면 메서드 추출
  if (fs.existsSync(servicePath)) {
    try {
      const existingContent = fs.readFileSync(servicePath, 'utf8');
      const methodMatches = existingContent.matchAll(/async\s+(\w+)\s*\([^)]*\):\s*Promise<[^>]+>\s*\{[\s\S]*?(?=\n\s*async|\n\s*\}[\s]*$)/g);
      for (const match of methodMatches) {
        existingMethods.push(match[0]);
      }
    } catch (error) {
      console.warn(`⚠️  Could not parse existing service file: ${error.message}`);
    }
  }
  
  const methodsCode = methods.map(method => {
    const methodName = method.name.charAt(0).toLowerCase() + method.name.slice(1);
    const requestType = method.requestType === 'google.protobuf.Empty' ? '{}' : `${method.requestType}Dto`;
    const responseType = method.responseType === 'google.protobuf.Empty' ? '{}' : `${method.responseType}Dto`;
    
    // 기존 메서드가 있는지 확인
    const existingMethod = existingMethods.find(em => em.includes(`async ${methodName}(`));
    
    if (existingMethod) {
      // 기존 메서드 유지
      return existingMethod;
    } else {
      // 새로운 메서드 생성
      return `  async ${methodName}(request: ${requestType}): Promise<${responseType}> {
    // TODO: Implement ${methodName} logic
    throw new Error('Method not implemented');
  }`;
    }
  }).join('\n\n');
  
  const serviceContent = `${imports.join('\n')}
${uniqueDtoImports.join('\n')}

@Injectable()
export class ${serviceMemberName} {
${methodsCode}
}`;

  // 백업 생성
  if (fs.existsSync(servicePath)) {
    const backupPath = `${servicePath}.backup.${Date.now()}`;
    fs.copyFileSync(servicePath, backupPath);
    console.log(`📄 Backed up existing service to: ${backupPath}`);
  }

  fs.writeFileSync(servicePath, serviceContent);
  console.log(`✅ Updated Service: ${servicePath}`);
}

// 모듈 파일 확인/생성
function ensureModule(serviceName, moduleName, moduleDir) {
  const controllerName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller`;
  const serviceMemberName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service`;
  const moduleMemberName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
  const modulePath = path.join(moduleDir, `${moduleName}.module.ts`);
  
  if (!fs.existsSync(modulePath)) {
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${controllerName} } from './${moduleName}.controller';
import { ${serviceMemberName} } from './${moduleName}.service';

@Module({
  controllers: [${controllerName}],
  providers: [${serviceMemberName}],
  exports: [${serviceMemberName}]
})
export class ${moduleMemberName} {}`;

    fs.writeFileSync(modulePath, moduleContent);
    console.log(`✅ Created Module: ${modulePath}`);
  } else {
    console.log(`📄 Module already exists: ${modulePath}`);
  }
}

// 메인 함수
function generateCodeFromProto(protoPath, outputDir = 'packages/game-server/src/modules') {
  if (!fs.existsSync(protoPath)) {
    throw new Error(`Proto file not found: ${protoPath}`);
  }
  
  const parsed = parseProtoFile(protoPath);
  
  if (!parsed.serviceName) {
    throw new Error('No service found in proto file');
  }
  
  const moduleName = parsed.serviceName.replace('Service', '').toLowerCase();
  
  // 디렉토리 생성
  const moduleDir = path.join(outputDir, moduleName);
  const dtoDir = path.join(moduleDir, 'dto');
  const constantsDir = path.join(moduleDir, 'constants');
  
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }
  
  if (!fs.existsSync(dtoDir)) {
    fs.mkdirSync(dtoDir, { recursive: true });
  }
  
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }
  
  console.log(`\n🎯 Generating code for ${parsed.serviceName}...`);
  console.log(`📁 Module directory: ${moduleDir}`);
  
  // DTO 파일 생성
  parsed.messages.forEach(message => {
    const dtoContent = generateDto(message, moduleName, parsed.messages);
    const dtoPath = path.join(dtoDir, `${message.name.toLowerCase()}.dto.ts`);
    fs.writeFileSync(dtoPath, dtoContent);
    console.log(`✅ Created DTO: ${path.relative(process.cwd(), dtoPath)}`);
  });
  
  // Enum 파일 생성
  parsed.enums.forEach(enumData => {
    const enumContent = generateEnum(enumData, moduleName);
    const enumPath = path.join(constantsDir, `${enumData.name.toLowerCase()}.enum.ts`);
    fs.writeFileSync(enumPath, enumContent);
    console.log(`✅ Created Enum: ${path.relative(process.cwd(), enumPath)}`);
  });
  
  // 컨트롤러 업데이트
  updateController(parsed.serviceName, parsed.methods, moduleName, moduleDir);
  
  // 서비스 업데이트
  updateService(parsed.serviceName, parsed.methods, moduleName, moduleDir);
  
  // 모듈 파일 확인/생성
  ensureModule(parsed.serviceName, moduleName, moduleDir);
  
  console.log(`\n🎉 Code generation completed for ${parsed.serviceName}!`);
  console.log(`📊 Generated:`);
  console.log(`   - ${parsed.messages.length} DTO files`);
  console.log(`   - ${parsed.enums.length} Enum files`);
  console.log(`   - ${parsed.methods.length} RPC methods`);
  console.log(`   - 1 Controller file`);
  console.log(`   - 1 Service file`);
  console.log(`   - 1 Module file`);
  
  return {
    moduleName,
    serviceName: parsed.serviceName,
    methods: parsed.methods,
    messages: parsed.messages,
    enums: parsed.enums,
    moduleDir
  };
}

// CLI 실행 부분
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚀 Proto Code Generator');
    console.log('');
    console.log('Usage: node proto-gen.js <proto-file-path> [output-directory]');
    console.log('');
    console.log('Examples:');
    console.log('  node proto-gen.js packages/outgame/src/grpc/proto/matching/matching.proto');
    console.log('  node proto-gen.js packages/outgame/src/grpc/proto/auth/auth.proto packages/outgame/src/modules');
    console.log('');
    console.log('Features:');
    console.log('  - Parses proto files and generates TypeScript code');
    console.log('  - Creates DTOs, Enums, Controllers, and Services');
    console.log('  - Preserves existing method implementations');
    console.log('  - Creates backup files before overwriting');
    process.exit(1);
  }
  
  const protoPath = args[0];
  const outputDir = args[1] || 'packages/outgame/src/modules';
  
  try {
    generateCodeFromProto(protoPath, outputDir);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateCodeFromProto }; 