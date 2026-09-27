import { sql } from './db';

export async function logAudit(
  actor: string,
  action: string,
  target: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  await sql`
    insert into audit_logs (actor, action, target, detail)
    values (${actor}, ${action}, ${target}, ${detail ? JSON.stringify(detail) : null})
  `;
}
