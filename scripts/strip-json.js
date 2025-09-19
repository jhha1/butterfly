// jsonc 파일의 주석제거. CI에서 json parse 에러 방지.
// 많은 도구들이 RFC-7159/ECMA-404 순수 JSON만 기대
import fs from 'fs';
import stripJsonComments from 'strip-json-comments';

function convertJsoncToJson(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'utf8');
  const withoutComments = stripJsonComments(content);
  const parsed = JSON.parse(withoutComments);
  fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`✔ Converted ${inputPath} → ${outputPath}`);
}

// 사용 예시: nest-cli.jsonc → nest-cli.json
convertJsoncToJson('nest-cli.jsonc', 'nest-cli.json');
