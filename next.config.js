/** @type {import('next').NextConfig} */
const nextConfig = {
    // 解決 Turbopack 偵測到 webpack 配置的錯誤
    // 設定為空物件即可告訴 Next.js 忽略遷移警告
    turbopack: {},

    // 如果你沒有特殊的 Webpack 外掛，建議移除之前的 webpack 區塊
    // 因為 Turbopack 目前不支援直接注入 webpack 函數

    devIndicators: {
        buildActivity: true,
        buildActivityPosition: "bottom-right",
    },
};

module.exports = nextConfig;