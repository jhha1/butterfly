import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';

@Entity('player')
export class Player {
  /**
   * ulid
   * primary key
   */
  @PrimaryColumn({ length: 26 })
  playerId!: string;

  /**
   * 플레이어 닉네임
   */
  @Column({ type: 'varchar' })
  nickname?: string;

  /**
   * 플레이어 레벨
   */
  @Column({ type: 'int' })
  level?: number;

  /**
   * 플레이어 생성 시각 (UTC)
   */
  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   *  플레이어 마지막 로긴 시각 (UTC)
   */
  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  lastloginAt?: Date;

  /**
   * 이 플레이어가 속한 계정 ID (foreign key)
   */
  @Index('idx_player_accountId')
  @Column({ length: 26 })
  accountId!: string;

  /**
   * 이 플레이어가 속한 Account
   */
  @ManyToOne('Account', 'accountId', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: any;
}