/**
 * ipwho-de.js 优化版 - Quantumult X
 * 功能：
 * 1. 多接口 GEO-IP 查询，失败自动切换
 * 2. 输出 IP、国家、城市、ISP
 * 3. 可根据国家自动切换策略（可自定义）
 * 4. 缓存 5 分钟，减少重复请求
 */

const API_LIST = [
    "https://api.ip.sb/geoip",
    "https://ipapi.co/json",
    "https://ipwho.de/json"
];

const CACHE_KEY = "geo_ip_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

(async function main() {
    let cached = $prefs.valueForKey(CACHE_KEY);
    if (cached) {
        try {
            let cachedData = JSON.parse(cached);
            if (Date.now() - cachedData.time < CACHE_DURATION) {
                return output(cachedData.data, true);
            }
        } catch (e) {}
    }

    let geoData = null;
    for (let url of API_LIST) {
        try {
            let resp = await $httpClient.get(url);
            if (!resp || !resp.body) continue;
            let data = JSON.parse(resp.body);
            if (data && (data.country || data.country_name)) {
                geoData = data;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (!geoData) {
        geoData = { ip: "0.0.0.0", country: "Unknown", city: "N/A", organization: "N/A" };
    }

    $prefs.setValueForKey(JSON.stringify({ time: Date.now(), data: geoData }), CACHE_KEY);
    output(geoData);
})();

function output(data, fromCache = false) {
    // 兼容不同接口字段
    let ip = data.ip || data.IP || "0.0.0.0";
    let country = data.country || data.country_name || "Unknown";
    let city = data.city || "N/A";
    let isp = data.org || data.organization || "N/A";

    // 可选策略判断（按国家切换）
    let strategy = country === "Japan" ? "JP节点" :
                   country === "China" ? "CN节点" : "Default";

    $done({
        title: fromCache ? `缓存 GEO-IP: ${ip}` : `GEO-IP: ${ip}`,
        body: `国家: ${country}\n城市: ${city}\nISP: ${isp}\n策略: ${strategy}`
    });
}
