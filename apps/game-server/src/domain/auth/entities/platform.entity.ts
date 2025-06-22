import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './account.entity';

export type PlatformType = 'google' | 'apple' | 'guest';

@Entity('platforms')
export class Platform {
  /**
   * 플랫폼에서 제공되는 고유 ID
   * primary key
   */
  @PrimaryColumn()
  platformId: string;

  /**
   * 플랫폼 타입 (google, apple, guest)
   */
  @Column({ type: 'enum', enum: ['google', 'apple', 'guest'] })
  platformType: PlatformType;

  /**
   * 이 Credential이 속한 Account
   */
  @ManyToOne(() => Account, account => account.platforms, { onDelete: 'CASCADE' })
  account: Account;
}