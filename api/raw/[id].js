// api/raw/[id].js - Protection agar tak boleh diakses dari browser
export default async function handler(req, res) {
    const { id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    
    // Cek jika dari browser (browser biasa)
    const isBrowser = userAgent.includes('Mozilla') && 
                     !userAgent.includes('Roblox') && 
                     !userAgent.includes('Lua');
    
    if (isBrowser) {
        // Return HTML dengan GUI protection
        return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Access Denied</title>
                <style>
                    body {
                        background: #0a0a0f;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: monospace;
                        color: #ff2d75;
                    }
                    .container {
                        text-align: center;
                        background: #111118;
                        padding: 40px;
                        border-radius: 16px;
                        border: 1px solid rgba(255,45,117,0.3);
                    }
                    h1 { font-size: 48px; margin-bottom: 20px; }
                    p { color: #6b6b8d; }
                </style>
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
    
    // Jika dari Roblox executor, return script content
    // Load script dari Gist atau database
    // ... logic to get script content by id
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(scriptContent);
}
