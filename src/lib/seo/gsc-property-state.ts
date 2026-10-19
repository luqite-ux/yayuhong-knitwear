/** Search Console property permission level 归一化 + 可读判定 */

export function canReadGscProperty(permissionLevel: string): boolean {
  // Search Console API 返回的 permissionLevel：owner / fullUser / restrictedUser / siteOwner / siteRestrictedUser / siteUnverifiedUser / unknown
  const level = permissionLevel?.toLowerCase() ?? 'unknown';
  if (level.includes('unverified')) return false;
  if (level.includes('unknown')) return false;
  // owner / fullUser / restrictedUser / siteOwner / siteRestrictedUser 都能读数据
  return true;
}
