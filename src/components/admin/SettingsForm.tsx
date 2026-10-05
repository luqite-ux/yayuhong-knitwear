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
  stats?: Record<string, string | number>;
  social_links?: Record<string, string>;
  footer_config?: Record<string, string>;
  hero_config?: Record<string, string>;
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
    // 核心数据指标
    stats_years_experience: profile?.stats?.years_experience || '',
    stats_daily_capacity: profile?.stats?.daily_capacity || '',
    stats_moq: profile?.stats?.moq || '',
    stats_sample_days: profile?.stats?.sample_days || '',
    stats_design_styles: profile?.stats?.design_styles || '',
    stats_factory_area: profile?.stats?.factory_area || '',
    stats_workers_count: profile?.stats?.workers_count || '',
    stats_countries_served: profile?.stats?.countries_served || '',
    // 社交链接
    social_facebook: profile?.social_links?.facebook || '',
    social_instagram: profile?.social_links?.instagram || '',
    social_linkedin: profile?.social_links?.linkedin || '',
    social_youtube: profile?.social_links?.youtube || '',
    social_tiktok: profile?.social_links?.tiktok || '',
    social_pinterest: profile?.social_links?.pinterest || '',
    social_wechat_qr_url: profile?.social_links?.wechat_qr_url || '',
    social_whatsapp_qr_url: profile?.social_links?.whatsapp_qr_url || '',
    // Footer 配置
    footer_copyright: profile?.footer_config?.copyright || '',
    footer_icp: profile?.footer_config?.icp || '',
    footer_company_footer: profile?.footer_config?.company_footer || '',
    footer_address_footer: profile?.footer_config?.address_footer || '',
    // Hero 配置
    hero_badges: profile?.hero_config?.badges || '',
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
        stats: {
          years_experience: data.stats_years_experience,
          daily_capacity: data.stats_daily_capacity,
          moq: data.stats_moq,
          sample_days: data.stats_sample_days,
          design_styles: data.stats_design_styles,
          factory_area: data.stats_factory_area,
          workers_count: data.stats_workers_count,
          countries_served: data.stats_countries_served,
        },
        social_links: {
          facebook: data.social_facebook,
          instagram: data.social_instagram,
          linkedin: data.social_linkedin,
          youtube: data.social_youtube,
          tiktok: data.social_tiktok,
          pinterest: data.social_pinterest,
          wechat_qr_url: data.social_wechat_qr_url,
          whatsapp_qr_url: data.social_whatsapp_qr_url,
        },
        footer_config: {
          copyright: data.footer_copyright,
          icp: data.footer_icp,
          company_footer: data.footer_company_footer,
          address_footer: data.footer_address_footer,
        },
        hero_config: {
          badges: data.hero_badges,
        },
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

      {/* 核心数据指标 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">核心数据指标（Stats）</h2>
        <p className="text-xs text-gray-400 mb-4">显示在首页的数字指标数据</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">行业经验（年）</label>
            <input className="admin-input" value={data.stats_years_experience} onChange={(e) => set('stats_years_experience', e.target.value)} placeholder="例如：20+" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日产能（件）</label>
            <input className="admin-input" value={data.stats_daily_capacity} onChange={(e) => set('stats_daily_capacity', e.target.value)} placeholder="例如：10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">起订量（MOQ）</label>
            <input className="admin-input" value={data.stats_moq} onChange={(e) => set('stats_moq', e.target.value)} placeholder="例如：100件" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">打样周期（天）</label>
            <input className="admin-input" value={data.stats_sample_days} onChange={(e) => set('stats_sample_days', e.target.value)} placeholder="例如：7-15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">设计款式数</label>
            <input className="admin-input" value={data.stats_design_styles} onChange={(e) => set('stats_design_styles', e.target.value)} placeholder="例如：500+" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">厂房面积（㎡）</label>
            <input className="admin-input" value={data.stats_factory_area} onChange={(e) => set('stats_factory_area', e.target.value)} placeholder="例如：8000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工人数量</label>
            <input className="admin-input" value={data.stats_workers_count} onChange={(e) => set('stats_workers_count', e.target.value)} placeholder="例如：200+" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服务国家数</label>
            <input className="admin-input" value={data.stats_countries_served} onChange={(e) => set('stats_countries_served', e.target.value)} placeholder="例如：30+" />
          </div>
        </div>
      </div>

      {/* 社交链接 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">社交链接（Social Links）</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input className="admin-input" value={data.social_facebook} onChange={(e) => set('social_facebook', e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input className="admin-input" value={data.social_instagram} onChange={(e) => set('social_instagram', e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input className="admin-input" value={data.social_linkedin} onChange={(e) => set('social_linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
            <input className="admin-input" value={data.social_youtube} onChange={(e) => set('social_youtube', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
            <input className="admin-input" value={data.social_tiktok} onChange={(e) => set('social_tiktok', e.target.value)} placeholder="https://tiktok.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pinterest</label>
            <input className="admin-input" value={data.social_pinterest} onChange={(e) => set('social_pinterest', e.target.value)} placeholder="https://pinterest.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">微信二维码图片URL</label>
            <input className="admin-input" value={data.social_wechat_qr_url} onChange={(e) => set('social_wechat_qr_url', e.target.value)} placeholder="微信二维码图片链接" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp二维码图片URL</label>
            <input className="admin-input" value={data.social_whatsapp_qr_url} onChange={(e) => set('social_whatsapp_qr_url', e.target.value)} placeholder="WhatsApp二维码图片链接" />
          </div>
        </div>
      </div>

      {/* Footer 配置 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer 配置</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">版权声明</label>
            <input className="admin-input" value={data.footer_copyright} onChange={(e) => set('footer_copyright', e.target.value)} placeholder="© 2024 亚裕鸿毛织厂 版权所有" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICP备案号</label>
            <input className="admin-input" value={data.footer_icp} onChange={(e) => set('footer_icp', e.target.value)} placeholder="粤ICP备XXXXXXXX号" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer公司名</label>
            <input className="admin-input" value={data.footer_company_footer} onChange={(e) => set('footer_company_footer', e.target.value)} placeholder="页脚显示的公司名称" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer地址</label>
            <input className="admin-input" value={data.footer_address_footer} onChange={(e) => set('footer_address_footer', e.target.value)} placeholder="页脚显示的地址信息" />
          </div>
        </div>
      </div>

      {/* Hero 配置 */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero 配置</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">认证徽章（逗号分隔）</label>
          <input className="admin-input" value={data.hero_badges} onChange={(e) => set('hero_badges', e.target.value)} placeholder="ISO9001, BSCI, SGS, OEKO-TEX" />
          <p className="text-xs text-gray-400 mt-1">多个徽章用英文逗号分隔，显示在首页 Hero 区域</p>
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
