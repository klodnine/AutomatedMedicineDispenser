// Chart.js is loaded globally via CDN in index.html
// This file provides the named export that dashboard.js expects
export const Chart = typeof window !== "undefined" ? window.Chart : null
