// api/raw.js - Vercel Serverless Function
// Ini akan return plain text script (bukan HTML)

// Simpan scripts dalam memory (atau boleh guna database)
// Untuk production, better guna localStorage Vercel KV atau database
let scriptsStore = {};

// Untuk demo, kita load dari environment variable atau default
// Tapi untuk full function, scripts akan disimpan dalam localStorage dashboard

export default async function handler(req, res) {
    const { id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // DETECT IF FROM BROWSER (bukan Roblox)
    const isBrowser = userAgent.includes('Mozilla') && 
                     !userAgent.includes('Roblox') && 
                     !userAgent.includes('Lua');
    
    // Kalau dari browser, return Access Denied (plain text)
    if (isBrowser) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(403).send('-- ACCESS DENIED --\n-- This script can only be executed in Roblox --\n-- Use: loadstring(game:HttpGet("' + req.url + '"))() --');
    }
    
    // Cari script berdasarkan ID
    // Scripts sepatutnya disimpan dalam database
    // Untuk demo, kita return script default
    const scripts = {
        "demo123": 'print("Hello from StarSix Community!")\nprint("Welcome to StarSix")',
        "example": '-- StarSix Example Script\nprint("StarSix Community Loadstring Working!")'
    };
    
    const script = scripts[id];
    
    if (!script) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(404).send('-- Script not found --');
    }
    
    // Return plain text script
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(script);
}
