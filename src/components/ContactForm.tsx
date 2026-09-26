'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--color-border)] text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
          {t('success').split('！')[0]}
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          {t('success')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--color-border)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('name')} *
          </label>
          <input
            type="text"
            required
            className="form-input"
            placeholder={locale === 'zh' ? '请输入您的姓名' : 'Enter your name'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('company')}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={locale === 'zh' ? '请输入公司名称' : 'Company name'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('email')} *
          </label>
          <input
            type="email"
            required
            className="form-input"
            placeholder={locale === 'zh' ? '请输入邮箱地址' : 'your@email.com'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('phone')}
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder={locale === 'zh' ? '请输入联系电话' : 'Phone number'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('product')}
          </label>
          <select className="form-input">
            <option value="">{locale === 'zh' ? '请选择' : 'Please select'}</option>
            <option value="women">{locale === 'zh' ? '女装毛衫' : "Women's Sweaters"}</option>
            <option value="kids">{locale === 'zh' ? '童装毛衫' : "Kids' Sweaters"}</option>
            <option value="men">{locale === 'zh' ? '男装毛衫' : "Men's Sweaters"}</option>
            <option value="loungewear">{locale === 'zh' ? '家居服' : 'Loungewear'}</option>
            <option value="pet">{locale === 'zh' ? '宠物衣帽' : 'Pet Apparel'}</option>
            <option value="other">{locale === 'zh' ? '其他' : 'Other'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('quantity')}
          </label>
          <select className="form-input">
            <option value="">{locale === 'zh' ? '请选择' : 'Please select'}</option>
            <option value="50-100">50 - 100 {locale === 'zh' ? '件' : 'pcs'}</option>
            <option value="100-500">100 - 500 {locale === 'zh' ? '件' : 'pcs'}</option>
            <option value="500-1000">500 - 1,000 {locale === 'zh' ? '件' : 'pcs'}</option>
            <option value="1000-5000">1,000 - 5,000 {locale === 'zh' ? '件' : 'pcs'}</option>
            <option value="5000+">5,000+ {locale === 'zh' ? '件' : 'pcs'}</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('message')} *
          </label>
          <textarea
            required
            rows={5}
            className="form-input form-textarea"
            placeholder={
              locale === 'zh'
                ? '请描述您的具体需求，如款式、材质、目标价格等，我们会尽快给您回复...'
                : 'Please describe your requirements, e.g. styles, materials, target price, etc. We will get back to you soon...'
            }
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full mt-6 justify-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('submitting')}
          </>
        ) : (
          <>
            {t('submit')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
