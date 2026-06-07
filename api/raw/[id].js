export default async function handler(req, res) {
  const { id } = req.query;
  
  // === INI PENTING UNTUK ROBOX ===
  // Set headers bagi Roblox boleh access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Senarai script anda
  const scripts = {
    'autofarm': 'print("Auto Farm Loaded!")\n-- Your script here',
    'esp': 'print("ESP Loaded!")\n-- Your script here',
    'aimbot': 'print("Aimbot Loaded!")\n-- Your script here'
  };
  
  const script = scripts[id];
  if (!script) {
    return res.status(404).send('-- Script not found');
  }
  
  // Check User-Agent (Access Denied untuk browser)
  const ua = req.headers['user-agent'] || '';
  const isRoblox = ua.includes('Roblox') || ua.includes('Lua');
  
  if (!isRoblox) {
    // Return HTML Access Denied
    return res.status(403).send(`<!DOCTYPE html>
<html>
<head><title>Access Denied</title>
<style>
body{background:#0a0a0f;display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;margin:0}
.container{text-align:center;background:#111118;padding:50px;border-radius:20px;border:1px solid #ff2d75}
h1{font-size:48px;color:#ff2d75;margin:0} p{color:#6b6b8d}
</style>
</head>
<body>
<div class="container">
<h1>⛔ ACCESS DENIED</h1>
<p>Raw script cannot be accessed from browser.</p>
<p>Use loadstring in Roblox executor only.</p>
</div>
</body>
</html>`);
  }
  
  // Untuk Roblox - return plain text
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(script);
}
