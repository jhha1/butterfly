import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';

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
  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   * 탈퇴 요청 시 기록되는 일자
   * 복구 시 null로 업데이트
   */
  @Column({ type: 'timestamp', precision: 0, nullable: true })
  deletionDate?: Date | null;

  /**
   * 외부 플랫폼 Credential
   */
  @OneToMany('Platform', 'account', { cascade: true })
  platforms?: any[];
}