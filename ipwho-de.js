/*
Quantumult X geo_location_checker 中文增强版
数据源：api.ip.sb（高精度）
显示：国家旗帜 + 中文地区 + 城市 + ISP
作者：ChatGPT (2025)
*/

;(async () => {
  const url = "https://api.ip.sb/geoip";
  const flagEmoji = (cc) => {
    if (!cc || cc.length !== 2) return "🏳️";
    const codePoints = [...cc.toUpperCase()].map(c => 127397 + c.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };
  try {
    const resp = await new Promise((resolve, reject) => {
      $httpClient.get(url, (error, response, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    const info = JSON.parse(resp);
    const ip = info.ip || info.query || "未知 IP";
    const cc = info.country_code || info.country_code_iso || "";
    const flag = flagEmoji(cc);
    const country = info.country || info.country_name || "未知国家";
    const region = info.region || info.region_name || "";
    const city = info.city || "";
    const isp = info.organization || info.org || info.isp || "未知运营商";

    // 中文化部分（常见地区翻译）
    const zhMap = {
      Japan: "日本",
      Korea: "韩国",
      China: "中国",
      Taiwan: "台湾",
      HongKong: "香港",
      Singapore: "新加坡",
      UnitedStates: "美国",
      Germany: "德国",
      Netherlands: "荷兰"
    };
    const zhCountry = zhMap[country.replace(/\s/g, "")] || country;

    const title = `${flag} ${zhCountry}${region ? "·" + region : ""}${city ? "·" + city : ""}`;
    const content = `IP：${ip}\n运营商：${isp}`;
    $done({
      title,
      content,
      icon: "globe.asia.australia.fill"
    });
  } catch (e) {
    $done({
      title: "查询失败",
      content: String(e),
      icon: "exclamationmark.triangle.fill"
    });
  }
})();
