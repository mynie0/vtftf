export default async function handler(req, res) {
    const { id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    
    // DETECT ROOBLOX EXECUTOR
    const isRoblox = userAgent.includes('Roblox') || 
                     userAgent.includes('Lua') || 
                     req.headers['accept']?.includes('text/plain');
    
    // Kalau dari browser → Access Denied
    if (!isRoblox) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Access Denied</title>
            <style>body{background:#0a0a0f;display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;}
            .container{text-align:center;background:#111118;padding:40px;border-radius:16px;border:1px solid rgba(255,45,117,0.3);}
            h1{font-size:48px;color:#ff2d75;} p{color:#6b6b8d;}</style>
            </head>
            <body>
            <div class="container">
                <h1>⛔ ACCESS DENIED</h1>
                <p>Raw script cannot be accessed directly from browser.</p>
                <p>Use loadstring in Roblox executor only.</p>
            </div>
            </body>
            </html>
        `);
    }
    
    // Load script dari database/Gist
    const scripts = {
        "demo123": 'print("Hello from StarSix!")\nprint("Welcome to StarSix Community")',
        // Tambah script lain...
    };
    
    const script = scripts[id];
    if (!script) {
        return res.status(404).send('-- Script not found');
    }
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(script);
}
