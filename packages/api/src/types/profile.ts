import type { UserRole } from "./enums";

export interface Profile {
  id: string;
  role: UserRole;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
