export const OAUTH_REQUESTED_ROLE_COOKIE = 'oauth_requested_role'

const ALLOWED = new Set([
  'admin',
  'manager',
  'project_lead',
  'team_lead',
  'developer',
])

export function parseOAuthRequestedRole(value: string | undefined): string | undefined {
  if (!value) return undefined
  const v = value.trim()
  return ALLOWED.has(v) ? v : undefined
}
