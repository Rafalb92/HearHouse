export type SafeUser = {
  id: string;
  email: string;
  roles: string[];
  status: string;
  displayName: string | null;
};
