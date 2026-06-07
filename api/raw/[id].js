// ============================================================
// STAR SIX COMMUNITY - VERCELL API FOR DELTA EXECUTOR
// Access Denied untuk browser, OK untuk Delta & Roblox
// ============================================================

// STORAGE - Simpan script di sini (boleh tambah melalui dashboard nanti)
let scripts = {
  "autofarm": `-- StarSix Community - Auto Farm Script
print("🔥 Auto Farm Loaded!")
print("StarSix Community - Auto Farm")

-- Your auto farm code here
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

print("✅ Auto Farm Ready for: " .. player.Name)

-- Contoh loop auto farm
task.spawn(function()
    while task.wait(1) do
        if humanoid.Health > 0 then
            print("⚡ Farming...")
            -- Tambah code auto farm anda di sini
        end
    end
end)
`,
  
  "esp": `-- StarSix Community - ESP Script
print("👁️ ESP Loaded!")

-- Your ESP code here
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

for _, player in ipairs(Players:GetPlayers()) do
    if player ~= LocalPlayer and player.Character then
        local highlight = Instance.new("Highlight")
        highlight.Parent = player.Character
        highlight.FillColor = Color3.fromRGB(255, 45, 117)
        highlight.OutlineColor = Color3.fromRGB(139, 92, 246)
        print("✅ ESP added for: " .. player.Name)
    end
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        task.wait(1)
        local highlight = Instance.new("Highlight")
        highlight.Parent = character
        highlight.FillColor = Color3.fromRGB(255, 45, 117)
        highlight.OutlineColor = Color3.fromRGB(139, 92, 246)
    end)
end)
`,
  
  "aimbot": `-- StarSix Community - Aimbot Script
print("🎯 Aimbot Loaded!")

-- Your aimbot code here
print("✅ Aimbot Ready!")
`,
  
  "speed": `-- StarSix Community - Speed Script
print("💨 Speed Script Loaded!")

local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

-- Set speed
humanoid.WalkSpeed = 50
humanoid.JumpPower = 80

print("✅ Speed set to 50 | Jump set to 80")
`,
  
  "fly": `-- StarSix Community - Fly Script
print("✈️ Fly Script Loaded!")

local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

local flying = false
local bodyVelocity = Instance.new("BodyVelocity")
local bodyGyro = Instance.new("BodyGyro")

bodyVelocity.MaxForce = Vector3.new(10000, 10000, 10000)
bodyGyro.MaxTorque = Vector3.new(100000, 100000, 100000)

-- Toggle fly with F key
game:GetService("UserInputService").InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.F then
        flying = not flying
        if flying then
            bodyVelocity.Parent = character.HumanoidRootPart
            bodyGyro.Parent = character.HumanoidRootPart
            humanoid.PlatformStand = true
            print("✅ Fly ON")
        else
            bodyVelocity:Destroy()
            bodyGyro:Destroy()
            humanoid.PlatformStand = false
            print("❌ Fly OFF")
        end
    end
end)

-- Update velocity
game:GetService("RunService").RenderStepped:Connect(function()
    if flying and character and character.HumanoidRootPart then
        local camera = workspace.CurrentCamera
        local moveDirection = Vector3.new()
        
        if game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.W) then
            moveDirection = moveDirection + camera.CFrame.LookVector
        end
        if game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.S) then
            moveDirection = moveDirection - camera.CFrame.LookVector
        end
        if game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.A) then
            moveDirection = moveDirection - camera.CFrame.RightVector
        end
        if game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.D) then
            moveDirection = moveDirection + camera.CFrame.RightVector
        end
        
        bodyVelocity.Velocity = moveDirection * 100 + Vector3.new(0, 
            (game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.Space) and 50 or 0) -
            (game:GetService("UserInputService"):IsKeyDown(Enum.KeyCode.LeftControl) and 50 or 0), 0)
        
        bodyGyro.CFrame = camera.CFrame
    end
end)
`
};

// Untuk save script baru (POST request)
let customScripts = {};

export default async function handler(req, res) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const userAgent = req.headers['user-agent'] || '';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, *');
  
  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // ============================================================
  // API untuk Dashboard (Manage Script)
  // ============================================================
  
  // GET /api/scripts - List semua script
  if (path === '/api/scripts' && method === 'GET') {
    const allScripts = { ...scripts, ...customScripts };
    const scriptList = Object.keys(allScripts).map(id => ({ id, name: id }));
    return res.status(200).json({ success: true, scripts: scriptList });
  }
  
  // GET /api/script/:id - Dapatkan 1 script
  if (path.startsWith('/api/script/') && method === 'GET') {
    const id = path.split('/').pop();
    const allScripts = { ...scripts, ...customScripts };
    const content = allScripts[id];
    
    if (!content) {
      return res.status(404).json({ success: false, error: 'Script not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      script: { 
        id: id, 
        name: id,
        content: content,
        url: `https://${req.headers.host}/raw/${id}`
      } 
    });
  }
  
  // POST /api/script - Tambah script baru
  if (path === '/api/script' && method === 'POST') {
    try {
      const body = req.body;
      const { id, content } = body;
      
      if (!id || !content) {
        return res.status(400).json({ success: false, error: 'ID and content required' });
      }
      
      customScripts[id] = content;
      return res.status(200).json({ 
        success: true, 
        script: { 
          id: id, 
          url: `https://${req.headers.host}/raw/${id}`,
          loadstring: `loadstring(game:HttpGet('https://${req.headers.host}/raw/${id}'))()`
        } 
      });
    } catch(e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }
  
  // DELETE /api/script/:id - Hapus script
  if (path.startsWith('/api/script/') && method === 'DELETE') {
    const id = path.split('/').pop();
    
    if (customScripts[id]) {
      delete customScripts[id];
      return res.status(200).json({ success: true });
    }
    
    if (scripts[id]) {
      return res.status(400).json({ success: false, error: 'Cannot delete default script' });
    }
    
    return res.status(404).json({ success: false, error: 'Script not found' });
  }
  
  // ============================================================
  // RAW ENDPOINT untuk Delta & Roblox Executor
  // ============================================================
  
  if (path.startsWith('/raw/')) {
    const id = path.split('/').pop();
    const allScripts = { ...scripts, ...customScripts };
    const scriptContent = allScripts[id];
    
    if (!scriptContent) {
      return res.status(404).send(`-- Script "${id}" not found
    
Available scripts: ${Object.keys(allScripts).join(', ')}`);
    }
    
    // DETECT Delta & Roblox Executor
    const isRoblox = userAgent.includes('Roblox') || 
                     userAgent.includes('Lua') ||
                     userAgent.includes('Delta') ||
                     userAgent.includes('Synapse') ||
                     userAgent.includes('Krnl') ||
                     userAgent.includes('Scriptware') ||
                     userAgent.includes('Fluxus') ||
                     userAgent.includes('Hydrogen') ||
                     userAgent.includes('Vega') ||
                     userAgent.includes('WeAreDevs') ||
                     userAgent.includes('JJSploit') ||
                     userAgent.includes('Electron') ||
                     userAgent.includes('Oxygen') ||
                     userAgent.includes('Solara') ||
                     userAgent.includes('Celery');
    
    // Jika dari browser -> ACCESS DENIED
    if (!isRoblox) {
      return res.status(403).send(`<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0a0f;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Courier New', monospace;
        }
        .container {
            text-align: center;
            background: #111118;
            padding: 60px 80px;
            border-radius: 24px;
            border: 1px solid #ff2d75;
            box-shadow: 0 0 50px rgba(255,45,117,0.2);
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon { font-size: 80px; margin-bottom: 20px; }
        h1 { font-size: 48px; color: #ff2d75; margin-bottom: 15px; }
        p { color: #6b6b8d; margin-bottom: 10px; font-size: 14px; }
        .code {
            background: rgba(0,0,0,0.3);
            padding: 12px 20px;
            border-radius: 10px;
            margin-top: 25px;
            font-size: 11px;
            color: #8b5cf6;
        }
        hr { border-color: #1a1a2e; margin: 20px 0; }
        .small { font-size: 10px; color: #3a3a4a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⛔</div>
        <h1>ACCESS DENIED</h1>
        <p>Raw script cannot be accessed directly from browser.</p>
        <p>Use loadstring in Delta or Roblox executor only.</p>
        <hr>
        <div class="code">🔐 StarSix Community Security System</div>
        <p class="small" style="margin-top: 15px;">Protected by StarSix Security v2.0</p>
    </div>
</body>
</html>`);
    }
    
    // Untuk Delta & Roblox - return script
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(scriptContent);
  }
  
  // Root path
  if (path === '/' || path === '') {
    return res.status(200).send(`StarSix Community API Vercel
    
✅ Status: ONLINE
✅ Support: Delta Executor, Roblox Executor
✅ Access Denied: Active for browsers

Available Scripts: ${Object.keys({ ...scripts, ...customScripts }).join(', ')}

Endpoints:
  GET  /api/scripts          - List all scripts
  GET  /api/script/:id       - Get script info
  POST /api/script           - Create script (id, content)
  DELETE /api/script/:id     - Delete script
  GET  /raw/:id              - Execute script (Roblox/Delta only)

For Delta Executor:
  loadstring(game:HttpGet('URL/raw/scriptname'))()
  
Example:
  loadstring(game:HttpGet('https://your-domain.vercel.app/raw/autofarm'))()
`);
  }
  
  return res.status(404).send('Not found');
}
