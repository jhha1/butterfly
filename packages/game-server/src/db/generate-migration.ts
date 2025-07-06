import { AppDataSource } from './data-source';
import { DataSource } from 'typeorm';

async function generateMigration() {
  try {
    // 데이터소스 초기화
    await AppDataSource.initialize();
    
    console.log('Data source initialized successfully');
    
    // 현재 스키마와 엔티티를 비교하여 마이그레이션 생성
    const sqlInMemory = await AppDataSource.driver.createSchemaBuilder().log();
    
    console.log('SQL in memory:', sqlInMemory);
    
    // 데이터소스 종료
    await AppDataSource.destroy();
    
    console.log('Migration generation completed');
  } catch (error) {
    console.error('Error generating migration:', error);
    process.exit(1);
  }
}

generateMigration(); 