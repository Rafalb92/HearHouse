import type { Role } from '@/users/entities/user.entity';

export type AuthUser = {
  id: string;
  email: string;
  roles: Role[];
};
