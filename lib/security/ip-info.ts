export async function getIpInfo(ip: string) {
  // ۱. اگر IP لوکال بود (برای تست روی لپ‌تاپ)
  if (
    !ip || 
    ip === 'unknown' || 
    ip === '127.0.0.1' || 
    ip === '::1' || 
    ip.includes('127.0.0.1') ||
    ip.startsWith('10.') || 
    ip.startsWith('192.168.') || 
    ip.startsWith('172.')
  ) {
    return { country: 'Local (لوکال)', isVpn: false };
  }

  try {
    // ۲. استفاده از سرویس ipwho.is (بهتر با ایران کار می‌کند)
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();
    
    if (data.success) {
      // در این سرویس، فیلد security نشان می‌دهد VPN است یا نه
      const isVpn = data.security?.vpn === true || data.security?.proxy === true || data.security?.tor === true;
      return { country: data.country || 'Unknown', isVpn };
    }
  } catch (error) {
    console.warn('IP info fetch failed:', error);
  }

  return { country: 'نامشخص', isVpn: false };
}