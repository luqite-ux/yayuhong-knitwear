// 询盘归因捕获：记录首次触点（UTM、Referrer、落地页），提交询盘时一并上传
// 数据存 localStorage，实现跨页面的首次触点持久化（last-non-direct 可后续扩展）

const STORAGE_KEY = 'yx_attr_v1';

export type Attribution = {
  referrer: string;
  landing_page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  first_touch_at: string;
};

const EMPTY: Attribution = {
  referrer: '',
  landing_page: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
  first_touch_at: '',
};

const UTM_KEYS: Array<keyof Attribution> = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readStored(): Attribution | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

function writeStored(attr: Attribution) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
  } catch {
    // ignore
  }
}

/**
 * 在页面加载时调用一次：捕获 URL 中的 UTM 参数、document.referrer、当前 URL。
 * 仅首次访问时写入（首次触点）；若后续访问带有新的 UTM，则更新 UTM（覆盖），保留 landing_page/referrer。
 */
export function captureAttribution(): Attribution {
  if (!isBrowser()) return EMPTY;

  const url = new URL(window.location.href);
  const stored = readStored();

  // 提取当前 URL 的 UTM
  const currentUtm: Partial<Attribution> = {};
  let hasUtm = false;
  UTM_KEYS.forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) {
      currentUtm[k] = v;
      hasUtm = true;
    }
  });

  // 外部 referrer（同站点跳转不算）
  const ref = document.referrer || '';
  const isExternalRef = ref && !ref.includes(window.location.host);

  if (!stored) {
    const fresh: Attribution = {
      ...EMPTY,
      ...currentUtm,
      referrer: isExternalRef ? ref : '',
      landing_page: window.location.href,
      first_touch_at: new Date().toISOString(),
    };
    writeStored(fresh);
    return fresh;
  }

  // 已有首次触点：UTM 覆盖更新（最近一次广告触点），其他保留
  let changed = false;
  const next: Attribution = { ...stored };
  if (hasUtm) {
    UTM_KEYS.forEach((k) => {
      const v = currentUtm[k];
      if (v && next[k] !== v) {
        next[k] = v;
        changed = true;
      }
    });
  }
  // 首次没有外部 referrer，后续出现了外部 referrer 则补上
  if (!next.referrer && isExternalRef) {
    next.referrer = ref;
    changed = true;
  }

  if (changed) writeStored(next);
  return next;
}

/** 提交询盘时读取归因（不重新捕获） */
export function getAttribution(): Attribution {
  return readStored() || EMPTY;
}
