import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';

@Entity('platforms')
export class Platform {
  /**
   * 플랫폼에서 제공되는 고유 ID
   * primary key
   */
  @PrimaryColumn()
  platformId!: string;

  /**
   * 플랫폼 타입 (google, apple, guest)
   */
  @Column({ type: 'int' })
  platformType!: number;

  /**
   * 이 Credential이 속한 Account
   */
  @ManyToOne('Account', 'platforms', { onDelete: 'CASCADE' })
  account!: any;
}