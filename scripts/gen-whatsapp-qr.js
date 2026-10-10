const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// WhatsApp 链接
const whatsappUrl = 'https://wa.me/8613829659110';

// 生成 800x800 的干净二维码（绿色，白色背景，无多余文字）
const outputPath = path.join(__dirname, '../public/images/whatsapp-qr.png');

QRCode.toFile(
  outputPath,
  whatsappUrl,
  {
    width: 800,
    margin: 2,
    color: {
      dark: '#25D366', // WhatsApp 绿色
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  },
  function (err) {
    if (err) {
      console.error('生成失败:', err);
    } else {
      console.log('WhatsApp 二维码已生成:', outputPath);
    }
  },
);
