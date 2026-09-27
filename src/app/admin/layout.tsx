import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" dir="ltr" suppressHydrationWarning>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
