import { UserProfile } from '../types';

export const SOFT_LIMIT = 50;

export function checkAndResetUsage(profile: UserProfile): UserProfile {
  return profile;
}

export function isUsageExceeded(_profile: UserProfile, _type: string): boolean {
  return false;
}
