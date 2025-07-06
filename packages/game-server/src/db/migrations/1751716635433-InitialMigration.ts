import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751716635433 implements MigrationInterface {
    name = 'Migrations1751716635433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`accounts\` (\`accountId\` varchar(26) NOT NULL, \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletionDate\` timestamp(0) NULL, PRIMARY KEY (\`accountId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`platforms\` (\`platformId\` varchar(255) NOT NULL, \`platformType\` int NOT NULL, \`accountAccountId\` varchar(26) NULL, PRIMARY KEY (\`platformId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`player\` (\`playerId\` varchar(26) NOT NULL, \`nickname\` varchar(255) NOT NULL, \`level\` int NOT NULL, \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`lastloginAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`accountId\` varchar(26) NOT NULL, INDEX \`idx_player_accountId\` (\`accountId\`), PRIMARY KEY (\`playerId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`platforms\` ADD CONSTRAINT \`FK_775443a11ad202026b9493ee9b7\` FOREIGN KEY (\`accountAccountId\`) REFERENCES \`accounts\`(\`accountId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`player\` ADD CONSTRAINT \`FK_4520868aa9f7ba9e681fa042d52\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`accountId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`player\` DROP FOREIGN KEY \`FK_4520868aa9f7ba9e681fa042d52\``);
        await queryRunner.query(`ALTER TABLE \`platforms\` DROP FOREIGN KEY \`FK_775443a11ad202026b9493ee9b7\``);
        await queryRunner.query(`DROP INDEX \`idx_player_accountId\` ON \`player\``);
        await queryRunner.query(`DROP TABLE \`player\``);
        await queryRunner.query(`DROP TABLE \`platforms\``);
        await queryRunner.query(`DROP TABLE \`accounts\``);
    }

}
