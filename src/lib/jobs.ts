import { sql } from './db';

export type JobTrigger = 'cron' | 'manual' | 'bootstrap';
export type JobStatus = 'running' | 'success' | 'partial' | 'failed' | 'skipped';

export interface JobRunRecord {
  id: string;
  job: string;
  trigger: JobTrigger;
  triggeredBy: string;
  status: JobStatus;
}

export async function startJobRun(
  job: string,
  trigger: JobTrigger,
  triggeredBy: string,
): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    insert into job_runs (job, trigger, triggered_by, status)
    values (${job}, ${trigger}, ${triggeredBy}, 'running')
    returning id
  `;
  return rows[0].id;
}

export async function finishJobRun(
  id: string,
  status: JobStatus,
  summary?: Record<string, unknown>,
  error?: string,
): Promise<void> {
  await sql`
    update job_runs
    set status = ${status},
        summary = ${summary ? JSON.stringify(summary) : null},
        error = ${error ?? null},
        finished_at = now()
    where id = ${id}
  `;
}

export async function recordJobStats(
  id: string,
  successCount: number,
  failureCount: number,
  costUsd: number,
): Promise<void> {
  await sql`
    update job_runs
    set success_count = ${successCount}, failure_count = ${failureCount}, cost_usd = ${costUsd}
    where id = ${id}
  `;
}
