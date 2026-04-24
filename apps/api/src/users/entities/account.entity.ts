import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AccountProviderType {
  CREDENTIALS = 'CREDENTIALS', // e-mail + hasło
  OAUTH = 'OAUTH', // Open Authorization (OAuth)
}

@Entity('accounts')
@Index(['provider', 'providerAccountId'], { unique: true })
@Index(['userId', 'provider'], { unique: true }) // opcjonalnie: jeden provider na user
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: AccountProviderType })
  providerType: AccountProviderType;

  // np. "credentials", "google", "github"
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  // dla credentials: można użyć email jako providerAccountId
  // dla OAuth: np. sub z Google
  @Column({ type: 'varchar', length: 191 })
  providerAccountId: string;

  // tylko dla CREDENTIALS:
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  // pola opcjonalne pod OAuth (na przyszłość)
  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
