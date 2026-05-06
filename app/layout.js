// app/layout.js
import './globals.css'; // 確保你有導入 Tailwind 的 CSS

export default function RootLayout({ children }) {
    return (
        <html lang="zh-HK">
            <body>{children}</body>
        </html>
    );
}