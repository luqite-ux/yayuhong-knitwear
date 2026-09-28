import nodemailer from 'nodemailer';

type Inquiry = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  locale: string;
};

const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;
const QQ_EMAIL = process.env.QQ_EMAIL || '3293958@qq.com';
const QQ_AUTH_CODE = process.env.QQ_AUTH_CODE;
const NOTIFY_EMAIL_TO = process.env.NOTIFY_EMAIL_TO || '3293958@qq.com';

async function notifyFeishu(inquiry: Inquiry) {
  if (!FEISHU_WEBHOOK_URL) return;

  const fields = [
    ['姓名', inquiry.name],
    ['邮箱', inquiry.email],
    ['电话', inquiry.phone || '未提供'],
    ['公司', inquiry.company || '未提供'],
    ['主题', inquiry.subject || '未提供'],
    ['留言', inquiry.message],
    ['语言', inquiry.locale],
    ['时间', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })],
  ];

  await fetch(FEISHU_WEBHOOK_URL, {
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
  if (!QQ_AUTH_CODE) return;

  const rows = [
    ['姓名', inquiry.name],
    ['邮箱', inquiry.email],
    ['电话', inquiry.phone || '未提供'],
    ['公司', inquiry.company || '未提供'],
    ['主题', inquiry.subject || '未提供'],
    ['留言', inquiry.message],
    ['语言', inquiry.locale],
    ['时间', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })],
  ];

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #4caf50; padding-bottom: 8px;">🔔 新询盘通知</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${rows.map(([k, v]) => `<tr><td style="padding: 8px 12px; background: #f5f5f5; font-weight: 600; width: 80px; border: 1px solid #e0e0e0;">${k}</td><td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${v}</td></tr>`).join('')}
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 16px;">此邮件由亚裕鸿毛织厂网站自动发送</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: QQ_EMAIL,
      pass: QQ_AUTH_CODE,
    },
  });

  await transporter.sendMail({
    from: `亚裕鸿网站 <${QQ_EMAIL}>`,
    to: NOTIFY_EMAIL_TO,
    subject: `[询盘] ${inquiry.name} - ${inquiry.subject || inquiry.message.slice(0, 20)}`,
    html,
  });
}

export async function notifyInquiry(inquiry: Inquiry) {
  await Promise.allSettled([notifyFeishu(inquiry), notifyEmail(inquiry)]);
}
