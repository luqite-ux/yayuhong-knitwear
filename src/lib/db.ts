import postgres from 'postgres';

let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('缺少环境变量 DATABASE_URL');
    _sql = postgres(url, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return _sql;
}

/**
 * 深度递归解析结果中的 JSON 字符串。
 * postgres.js 默认不会自动解析 jsonb 字段（返回字符串），
 * 这里统一处理，确保所有看起来像 JSON 的值都被正确解析为对象。
 */
export function deepParseJson(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }
  if (Array.isArray(val)) return val.map(deepParseJson);
  if (typeof val === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      result[k] = deepParseJson(v);
    }
    return result;
  }
  return val;
}

// 用一个函数作为代理目标，支持 sql`...` 调用
const _sqlProxy = function () {} as unknown as ReturnType<typeof postgres>;

export const sql = new Proxy(_sqlProxy, {
  get(_, prop) {
    const target = getSql();
    const value = Reflect.get(target, prop, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
  apply(_, thisArg, args) {
    const target = getSql();
    const result = Reflect.apply(target, thisArg, args);
    // 模板标签调用返回 Promise，统一做 JSON 解析
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return (result as Promise<unknown>).then((rows) => deepParseJson(rows));
    }
    return deepParseJson(result);
  },
});

export type Sql = ReturnType<typeof postgres>;
