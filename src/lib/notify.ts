import nodemailer from 'nodemailer';
import { getSecret } from './secrets';

type Inquiry = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  locale: string;
};

async function getFeishuWebhook(): Promise<string | null> {
  // 优先从数据库读取（接入向导保存的配置）
  try {
    const raw = await getSecret('notification');
    if (raw) {
      const cfg = JSON.parse(raw);
      if (cfg.url && cfg.type === 'feishu') return cfg.url;
    }
  } catch {
    // 忽略错误，fallback 到环境变量
  }
  return process.env.FEISHU_WEBHOOK_URL || null;
}

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  to: string;
};

async function getEmailConfig(): Promise<EmailConfig | null> {
  // 优先从数据库读取
  try {
    const raw = await getSecret('notification_email');
    if (raw) {
      const cfg = JSON.parse(raw);
      if (cfg.host && cfg.user && cfg.pass) {
        return {
          host: cfg.host,
          port: Number(cfg.port) || 465,
          secure: cfg.secure !== false,
          user: cfg.user,
          pass: cfg.pass,
          fromName: cfg.fromName || '网站通知',
          to: cfg.to || cfg.user,
        };
      }
    }
  } catch {
    // 忽略错误，fallback 到环境变量
  }
  // 环境变量兼容（QQ 邮箱）
  if (process.env.QQ_AUTH_CODE) {
    return {
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      user: process.env.QQ_EMAIL || '3293958@qq.com',
      pass: process.env.QQ_AUTH_CODE,
      fromName: '网站通知',
      to: process.env.NOTIFY_EMAIL_TO || process.env.QQ_EMAIL || '3293958@qq.com',
    };
  }
  return null;
}

function buildFields(inquiry: Inquiry) {
  return [
    ['姓名', inquiry.name],
    ['邮箱', inquiry.email],
    ['电话', inquiry.phone || '未提供'],
    ['公司', inquiry.company || '未提供'],
    ['主题', inquiry.subject || '未提供'],
    ['留言', inquiry.message],
    ['语言', inquiry.locale],
    ['时间', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })],
  ];
}

async function notifyFeishu(inquiry: Inquiry) {
  const webhook = await getFeishuWebhook();
  if (!webhook) return;

  const fields = buildFields(inquiry);

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: '🔔 新询盘通知' },
          template: 'green',
        },
        elements: [
          {
            tag: 'div',
            text: { tag: 'lark_md', content: fields.map(([k, v]) => `**${k}**: ${v}`).join('\n') },
          },
        ],
      },
    }),
  });
}

async function notifyEmail(inquiry: Inquiry) {
  const cfg = await getEmailConfig();
  if (!cfg) return;

  const rows = buildFields(inquiry);

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #4caf50; padding-bottom: 8px;">🔔 新询盘通知</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${rows.map(([k, v]) => `<tr><td style="padding: 8px 12px; background: #f5f5f5; font-weight: 600; width: 80px; border: 1px solid #e0e0e0;">${k}</td><td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${v}</td></tr>`).join('')}
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 16px;">此邮件由网站自动发送</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  await transporter.sendMail({
    from: `${cfg.fromName} <${cfg.user}>`,
    to: cfg.to,
    subject: `[询盘] ${inquiry.name} - ${inquiry.subject || inquiry.message.slice(0, 20)}`,
    html,
  });
}

export async function notifyInquiry(inquiry: Inquiry) {
  await Promise.allSettled([notifyFeishu(inquiry), notifyEmail(inquiry)]);
}
