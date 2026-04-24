import type { Role } from '@/users/entities/user.entity';

export type JwtAccessPayload = {
  sub: string; // userId
  email: string;
  roles: Role[];
};

export type JwtRefreshPayload = {
  sub: string; // userId
  jti: string; // unique token id
};

export type GoogleProfile = {
  id: string;
  email: string;
  displayName: string | null;
  picture: string | null;
};
