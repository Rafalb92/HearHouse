import { SafeUser } from './safe-user.type';

export type LinkAccountResult =
  | { status: 'ok'; user: SafeUser }
  | { status: 'requires_linking'; linkToken: string; email: string };
