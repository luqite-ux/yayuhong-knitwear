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
    return Reflect.apply(target, thisArg, args);
  },
});

export type Sql = ReturnType<typeof postgres>;
