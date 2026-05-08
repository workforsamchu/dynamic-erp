/** @type {import('next').NextConfig} */
const nextConfig = {
    // 強制開啟 React 嚴格模式，有助於在開發階段發現 Socket.io 的重複連線問題
    reactStrictMode: true,

    // Turbopack 配置：目前設定為空物件以符合 Next.js 15+ 的規範並忽略遷移警告
    experimental: {
        // 如果你的專案有用到 mongoose，建議加入此設定
        // 這能防止 Turbopack 嘗試打包那些不支援邊緣環境的後端套件
        serverComponentsExternalPackages: ["mongoose"],
    },

    // 這裡保留你原本的開發指標設定
    devIndicators: {
        appIsrStatus: true, // 顯示靜態頁面生成的狀態
        buildActivity: true,
        buildActivityPosition: "bottom-right",
    },

    // 如果之後需要處理跨域請求（例如後端 Socket Server 在不同網域）
    // 可以在這裡加入 images 或 rewrites 配置
};

// 確保使用 ESM 導出語法，解決 "module is not defined" 錯誤
export default nextConfig;