'use client';

import { useState } from 'react';

interface SiteProfile {
  site_name?: Record<string, string>;
  company_name?: string;
  domain?: string;
  default_locale?: string;
  logo_url?: string;
  contact?: Record<string, string>;
  intro?: Record<string, string>;
  brand_voice?: string;
  google_verification?: string;
  baidu_verification?: string;
  baidu_analytics?: string;
  baidu_push_token?: string;
  haosou_verification?: string;
  sogou_verification?: string;
  shenma_verification?: string;
  doubao_verification?: string;
  china_seo?: Record<string, string>;
  china_geo?: Record<string, string>;
}

export default function SettingsForm({ profile }: { profile: SiteProfile }) {
  const [data, setData] = useState({
    site_name_zh: profile?.site_name?.zh || '',
    site_name_en: profile?.site_name?.en || '',
    site_name_ru: profile?.site_name?.ru || '',
    company_name: profile?.company_name || '',
    domain: profile?.domain || 'xiuyuknit.com',
    default_locale: profile?.default_locale || 'zh',
    logo_url: profile?.logo_url || '',
    brand_voice: profile?.brand_voice || '',
    google_verification: profile?.google_verification || '',
    // 国内 SEO
    baidu_verification: profile?.baidu_verification || '',
    baidu_analytics: profile?.baidu_analytics || '',
    baidu_push_token: profile?.baidu_push_token || '',
    haosou_verification: profile?.haosou_verification || '',
    sogou_verification: profile?.sogou_verification || '',
    shenma_verification: profile?.shenma_verification || '',
    doubao_verification: profile?.doubao_verification || '',
    china_seo_keywords: profile?.china_seo?.keywords || '',
    china_seo_author: profile?.china_seo?.author || '亚裕鸿毛织厂',
    china_seo_copyright: profile?.china_seo?.copyright || '亚裕鸿毛织厂 版权所有',
    // 联系方式
    contact_phone: profile?.contact?.phone || '',
    contact_email: profile?.contact?.email || '',
    contact_address: profile?.contact?.address || '',
    contact_wechat: profile?.contact?.wechat || '',
    contact_whatsapp: profile?.contact?.whatsapp || '',
    intro_zh: profile?.intro?.zh || '',
    intro_en: profile?.intro?.en || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(field: string, value: string) {
    setData((p) => ({ ...p, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_name: { zh: data.site_name_zh, en: data.site_name_en, ru: data.site_name_ru },
        company_name: data.company_name,
        domain: data.domain,
        default_locale: data.default_locale,
        logo_url: data.logo_url,
        contact: {
          phone: data.contact_phone, email: data.contact_email,
          address: data.contact_address, wechat: data.contact_wechat, whatsapp: data.contact_whatsapp,
        },
        intro: { zh: data.intro_zh, en: data.intro_en },
        brand_voice: data.brand_voice,
        google_verification: data.google_verification,
        baidu_verification: data.baidu_verification,
        baidu_analytics: data.baidu_analytics,
        baidu_push_token: data.baidu_push_token,
        haosou_verification: data.haosou_verification,
        sogou_verification: data.sogou_verification,
        shenma_verification: data.shenma_verification,
        doubao_verification: data.doubao_verification,
        china_seo: {
          keywords: data.china_seo_keywords,
          author: data.china_seo_author,
          copyright: data.china_seo_copyright,
        },
        china_geo: {},
      }),
    });
    if (res.ok) { setSaved(true); }
    setSaving(false);
  }

  return (
    <div className="admin-card max-w-3xl space-y-6">
      {/* 站点信息 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">站点信息</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点名（中）</label>
            <input className="admin-input" value={data.site_name_zh} onChange={(e) => set('site_name_zh', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点名（英）</label>
            <input className="admin-input" value={data.site_name_en} onChange={(e) => set('site_name_en', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点名（俄）</label>
            <input className="admin-input" value={data.site_name_ru} onChange={(e) => set('site_name_ru', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
            <input className="admin-input" value={data.company_name} onChange={(e) => set('company_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">域名</label>
            <input className="admin-input" value={data.domain} onChange={(e) => set('domain', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">默认语言</label>
            <select className="admin-input" value={data.default_locale} onChange={(e) => set('default_locale', e.target.value)}>
              <option value="zh">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">英文</option>
              <option value="ru">俄文</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google 验证码</label>
            <input className="admin-input" value={data.google_verification} onChange={(e) => set('google_verification', e.target.value)} placeholder="google-site-verification: ..." />
          </div>
        </div>
      </div>

      {/* 国内 SEO 设置 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">国内站 SEO（xiuyumaoshan.cn）</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">百度站点验证</label>
            <input className="admin-input" value={data.baidu_verification} onChange={(e) => set('baidu_verification', e.target.value)} placeholder="百度站长平台验证码" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">百度统计 ID</label>
            <input className="admin-input" value={data.baidu_analytics} onChange={(e) => set('baidu_analytics', e.target.value)} placeholder="hm.js? 后面的 hash" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">360好搜验证</label>
            <input className="admin-input" value={data.haosou_verification} onChange={(e) => set('haosou_verification', e.target.value)} placeholder="360站长平台验证码" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜狗验证</label>
            <input className="admin-input" value={data.sogou_verification} onChange={(e) => set('sogou_verification', e.target.value)} placeholder="搜狗站长平台验证码" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">神马验证</label>
            <input className="admin-input" value={data.shenma_verification} onChange={(e) => set('shenma_verification', e.target.value)} placeholder="神马站长平台验证码" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">豆包AI搜索验证</label>
            <input className="admin-input" value={data.doubao_verification} onChange={(e) => set('doubao_verification', e.target.value)} placeholder="豆包搜索平台验证码" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">百度主动推送 Token</label>
          <input className="admin-input" value={data.baidu_push_token} onChange={(e) => set('baidu_push_token', e.target.value)} placeholder="百度资源平台普通推送 token" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">国内 SEO 关键词</label>
          <textarea className="admin-input" rows={2} value={data.china_seo_keywords} onChange={(e) => set('china_seo_keywords', e.target.value)} placeholder="毛衫厂,毛衣定制,毛织厂,澄海毛织..." />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作者 / 企业名</label>
            <input className="admin-input" value={data.china_seo_author} onChange={(e) => set('china_seo_author', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">版权声明</label>
            <input className="admin-input" value={data.china_seo_copyright} onChange={(e) => set('china_seo_copyright', e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          提示：配置后，国内站会自动注入对应搜索引擎的验证 meta、百度统计脚本和结构化数据。
        </p>
      </div>

      {/* 联系方式 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">联系方式</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input className="admin-input" value={data.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input className="admin-input" value={data.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input className="admin-input" value={data.contact_address} onChange={(e) => set('contact_address', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">微信</label>
            <input className="admin-input" value={data.contact_wechat} onChange={(e) => set('contact_wechat', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input className="admin-input" value={data.contact_whatsapp} onChange={(e) => set('contact_whatsapp', e.target.value)} />
          </div>
        </div>
      </div>

      {/* 简介 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">简介与品牌口吻</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简介（中）</label>
            <textarea className="admin-input" rows={3} value={data.intro_zh} onChange={(e) => set('intro_zh', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简介（英）</label>
            <textarea className="admin-input" rows={3} value={data.intro_en} onChange={(e) => set('intro_en', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">品牌口吻</label>
            <textarea className="admin-input" rows={2} value={data.brand_voice} onChange={(e) => set('brand_voice', e.target.value)} placeholder="专业、务实、强调工厂直供..." />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? '保存中...' : '保存设置'}
        </button>
        {saved && <span className="text-sm text-green-600">已保存</span>}
      </div>
    </div>
  );
}
