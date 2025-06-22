import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Platform } from './platform.entity';

@Entity('accounts')
export class Account {
  /**
   * ulid
   * primary key
   */
  @PrimaryColumn({ length: 26 })
  accountId!: string;

  /**
   * UTC 기반 계정 생성 시각
   */
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   * 탈퇴 요청 시 기록되는 일자
   * 복구 시 null로 업데이트
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  deletionDate?: Date | null;

  /**
   * 외부 플랫폼 Credential
   */
  @OneToMany(() => Platform, platform => platform.account, { cascade: true })
  platforms?: Platform[];
}