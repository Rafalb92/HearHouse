import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  lastName: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  avatarUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
