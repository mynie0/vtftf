const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');

// ============ KONFIGURASI ============
// GANTI DENGAN DATA DARI DISCORD DEVELOPER PORTAL!!!
const DISCORD_TOKEN = 'MTUxMDg3OTA0MjQzNjMzMzU3OA.GNy2U7.MIhIuWlJK5qS9tRVIrJKWS1DZoZ1pDeS-4TI9U.G5VAv7.KP6yYP8KS58qv0xTUHj4X-YUbKd2eWopro5A4k';
const CLIENT_ID = '1510879042436333578';
const GUILD_ID = '1427684520530022517';

// KONFIGURASI GIST (SAMA DENGAN WEB PANEL)
const GIST_ID = "436734a001bef407c514615ebff6ede3";
const GITHUB_TOKEN = "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";

// Role yang bisa akses admin commands
const ALLOWED_ROLES = ['Admin', 'Moderator', 'Owner', 'StarSix'];

// ============ INIT BOT ============
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// ============ FUNGSI BANTUAN ============

// Generate key ID dengan format StarSix
function generateKeyId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let parts = [];
    for (let i = 0; i < 4; i++) {
        let part = "";
        for (let j = 0; j < 4; j++) {
            part += chars[Math.floor(Math.random() * 36)];
        }
        parts.push(part);
    }
    return `STS-${parts[0]}-${parts[1]}-${parts[2]}`;
}

// Ambil data dari Gist
async function fetchGistData() {
    try {
        const response = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const content = response.data.files['keys.json']?.content;
        return content ? JSON.parse(content) : { keys: {} };
    } catch (error) {
        console.error('Error fetch gist:', error.message);
        return null;
    }
}

// Update data ke Gist
async function updateGistData(database) {
    try {
        const getRes = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const fileSha = getRes.data.files['keys.json']?.sha;
        
        await axios.patch(`https://api.github.com/gists/${GIST_ID}`, {
            files: {
                'keys.json': { 
                    content: JSON.stringify(database, null, 2),
                    sha: fileSha
                }
            }
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return true;
    } catch (error) {
        console.error('Error update gist:', error.message);
        return false;
    }
}

// Cek apakah username punya key aktif
async function isUsernameHasActiveKey(username) {
    const data = await fetchGistData();
    if (!data?.keys) return false;
    
    const now = new Date();
    for (const keyData of Object.values(data.keys)) {
        if (keyData.username?.toLowerCase() === username.toLowerCase() && new Date(keyData.expire) > now) {
            return true;
        }
    }
    return false;
}

// Generate key baru
async function generateKey(username, discordId, userId = "") {
    if (!username || username.trim() === "") {
        return { success: false, error: "❌ Username tidak boleh kosong!" };
    }
    
    username = username.trim();
    
    if (username.length < 3) {
        return { success: false, error: "❌ Username minimal 3 karakter!" };
    }
    
    // Cek apakah username sudah punya key aktif
    const hasActive = await isUsernameHasActiveKey(username);
    if (hasActive) {
        return { success: false, error: "⚠️ Username ini sudah memiliki key aktif! Tunggu 24 jam hingga expired." };
    }
    
    // Generate key
    const newKey = generateKeyId();
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);
    
    const data = await fetchGistData();
    const database = data || { keys: {} };
    
    database.keys[newKey] = {
        username: username,
        userId: userId,
        discordId: discordId,
        expire: expireDate.toISOString(),
        createdAt: new Date().toISOString(),
        source: "discord",
        product: "StarSix"
    };
    
    const saved = await updateGistData(database);
    
    if (saved) {
        return {
            success: true,
            key: newKey,
            username: username,
            expire: expireDate
        };
    } else {
        return { success: false, error: "❌ Gagal menyimpan key. Coba lagi nanti." };
    }
}

// Cek permission admin
function isAdmin(member) {
    return member.roles.cache.some(role => ALLOWED_ROLES.includes(role.name)) || 
           member.permissions.has('Administrator');
}

// ============ REGISTER COMMANDS ============

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('getkey')
            .setDescription('🎮 Dapatkan license key StarSix')
            .addStringOption(option =>
                option.setName('username')
                    .setDescription('Roblox username Anda')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('userid')
                    .setDescription('Roblox User ID (opsional)')
                    .setRequired(false)),
        
        new SlashCommandBuilder()
            .setName('mykey')
            .setDescription('🔑 Cek license key StarSix Anda saat ini'),
        
        new SlashCommandBuilder()
            .setName('redeem')
            .setDescription('🎫 Redeem license key')
            .addStringOption(option =>
                option.setName('key')
                    .setDescription('License key Anda')
                    .setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('cekkey')
            .setDescription('🔍 Cek status key (Admin only)')
            .addStringOption(option =>
                option.setName('key')
                    .setDescription('License key')
                    .setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('revoke')
            .setDescription('🗑️ Hapus license key (Admin only)')
            .addStringOption(option =>
                option.setName('key')
                    .setDescription('License key')
                    .setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('stats')
            .setDescription('📊 Lihat statistik key StarSix (Admin only)'),
        
        new SlashCommandBuilder()
            .setName('broadcast')
            .setDescription('📢 Kirim pengumuman ke semua user (Admin only)')
            .addStringOption(option =>
                option.setName('pesan')
                    .setDescription('Pesan yang ingin disampaikan')
                    .setRequired(true)),
    ];
    
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    
    try {
        console.log('📡 Mendaftarkan commands...');
        if (GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands.map(cmd => cmd.toJSON()) }
            );
        } else {
            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands.map(cmd => cmd.toJSON()) }
            );
        }
        console.log('✅ Commands berhasil didaftarkan!');
    } catch (error) {
        console.error('❌ Gagal register commands:', error);
    }
}

// ============ HANDLE COMMANDS ============

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const { commandName, user, member, options } = interaction;
    
    // Command /getkey
    if (commandName === 'getkey') {
        const username = options.getString('username');
        const userId = options.getString('userid') || "";
        
        await interaction.deferReply({ ephemeral: true });
        
        const result = await generateKey(username, user.id, userId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('✨ STAR SIX - LICENSE KEY GENERATED! ✨')
                .setDescription(`🎮 License key untuk **${result.username}** berhasil dibuat!`)
                .addFields(
                    { name: '🔑 LICENSE KEY', value: `\`\`\`${result.key}\`\`\``, inline: false },
                    { name: '⏰ BERLAKU SAMPAI', value: `<t:${Math.floor(result.expire.getTime() / 1000)}:F>`, inline: true },
                    { name: '📋 DURASI', value: '24 Jam', inline: true },
                    { name: '🎮 PRODUCT', value: 'StarSix', inline: true }
                )
                .setFooter({ text: 'StarSix License System • Simpan key Anda dengan aman!' })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0xFF4444)
                .setTitle('❌ STAR SIX - GAGAL MEMBUAT KEY')
                .setDescription(result.error)
                .setFooter({ text: 'StarSix License System' });
            
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    
    // Command /mykey
    if (commandName === 'mykey') {
        await interaction.deferReply({ ephemeral: true });
        
        const data = await fetchGistData();
        let userKey = null;
        const now = new Date();
        
        if (data?.keys) {
            for (const [keyId, keyData] of Object.entries(data.keys)) {
                if (keyData.discordId === user.id && new Date(keyData.expire) > now) {
                    userKey = { keyId, ...keyData };
                    break;
                }
            }
        }
        
        if (userKey) {
            const expireDate = new Date(userKey.expire);
            const hoursLeft = Math.ceil((expireDate - now) / (1000 * 60 * 60));
            const minutesLeft = Math.ceil((expireDate - now) / (1000 * 60));
            
            let timeLeft = "";
            if (hoursLeft >= 24) {
                timeLeft = `${Math.floor(hoursLeft / 24)} hari`;
            } else if (hoursLeft >= 1) {
                timeLeft = `${hoursLeft} jam`;
            } else {
                timeLeft = `${minutesLeft} menit`;
            }
            
            const embed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('🔑 STAR SIX - LICENSE KEY ANDA')
                .setDescription('Berikut adalah detail license key Anda:')
                .addFields(
                    { name: '🎮 License Key', value: `\`\`\`${userKey.keyId}\`\`\``, inline: false },
                    { name: '👤 Roblox Username', value: userKey.username, inline: true },
                    { name: '⏰ Sisa Waktu', value: timeLeft, inline: true },
                    { name: '📅 Expired', value: `<t:${Math.floor(expireDate.getTime() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'StarSix - Enjoy your access!' })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0xFFAA44)
                .setTitle('🎮 STAR SIX - BELUM PUNYA KEY')
                .setDescription('Kamu belum memiliki license key StarSix yang aktif!')
                .addFields(
                    { name: '📝 Cara Mendapatkan Key', value: 'Gunakan command `/getkey` diikuti dengan Roblox username Anda.\n\nContoh: `/getkey username:YourRobloxName`', inline: false },
                    { name: '⏰ Durasi', value: 'Key berlaku selama 24 jam.', inline: true },
                    { name: '🎁 Product', value: 'StarSix', inline: true }
                )
                .setFooter({ text: 'StarSix License System' });
            
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    
    // Command /cekkey (Admin only)
    if (commandName === 'cekkey') {
        if (!isAdmin(member)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF4444)
                .setTitle('⛔ ACCESS DENIED')
                .setDescription('Command ini hanya untuk **Admin/Moderator** StarSix!');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const keyCode = options.getString('key');
        await interaction.deferReply({ ephemeral: true });
        
        const data = await fetchGistData();
        const keyData = data?.keys?.[keyCode];
        
        if (!keyData) {
            return await interaction.editReply({ 
                content: `❌ Key \`${keyCode}\` tidak ditemukan dalam database StarSix!`, 
                ephemeral: true 
            });
        }
        
        const expireDate = new Date(keyData.expire);
        const isExpired = new Date() > expireDate;
        
        const embed = new EmbedBuilder()
            .setColor(isExpired ? 0xFF4444 : 0x44FF44)
            .setTitle(isExpired ? '⚠️ STAR SIX - KEY EXPIRED' : '✅ STAR SIX - KEY AKTIF')
            .addFields(
                { name: '🔑 Key', value: `\`${keyCode}\``, inline: false },
                { name: '👤 Roblox Username', value: keyData.username, inline: true },
                { name: '🆔 Discord ID', value: keyData.discordId || '-', inline: true },
                { name: '📅 Dibuat', value: new Date(keyData.createdAt).toLocaleString(), inline: true },
                { name: '⏰ Expired', value: expireDate.toLocaleString(), inline: true }
            )
            .setFooter({ text: 'StarSix Admin Panel' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    
    // Command /revoke (Admin only)
    if (commandName === 'revoke') {
        if (!isAdmin(member)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF4444)
                .setTitle('⛔ ACCESS DENIED')
                .setDescription('Command ini hanya untuk **Admin/Moderator** StarSix!');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const keyCode = options.getString('key');
        await interaction.deferReply({ ephemeral: true });
        
        const data = await fetchGistData();
        
        if (!data?.keys?.[keyCode]) {
            return await interaction.editReply({ 
                content: `❌ Key \`${keyCode}\` tidak ditemukan!`, 
                ephemeral: true 
            });
        }
        
        const revokedData = data.keys[keyCode];
        delete data.keys[keyCode];
        
        const saved = await updateGistData(data);
        
        if (saved) {
            const embed = new EmbedBuilder()
                .setColor(0xFFAA44)
                .setTitle('🗑️ STAR SIX - KEY BERHASIL DIREVOKE')
                .addFields(
                    { name: '🔑 Key', value: `\`${keyCode}\``, inline: true },
                    { name: '👤 Owner', value: revokedData.username, inline: true },
                    { name: '🛠️ Direvoke oleh', value: user.tag, inline: true }
                )
                .setFooter({ text: 'StarSix Admin Action' });
            
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.editReply({ 
                content: '❌ Gagal merevoke key! Coba lagi.', 
                ephemeral: true 
            });
        }
    }
    
    // Command /stats (Admin only)
    if (commandName === 'stats') {
        if (!isAdmin(member)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF4444)
                .setTitle('⛔ ACCESS DENIED');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        await interaction.deferReply({ ephemeral: true });
        
        const data = await fetchGistData();
        const keys = data?.keys || {};
        const now = new Date();
        
        let active = 0;
        let expired = 0;
        let discordKeys = 0;
        let webKeys = 0;
        
        for (const keyData of Object.values(keys)) {
            if (new Date(keyData.expire) > now) {
                active++;
            } else {
                expired++;
            }
            
            if (keyData.source === 'discord') {
                discordKeys++;
            } else {
                webKeys++;
            }
        }
        
        const embed = new EmbedBuilder()
            .setColor(0xFF6B35)
            .setTitle('📊 STAR SIX - STATISTIK LICENSE KEY')
            .setDescription('Berikut adalah statistik license key StarSix:')
            .addFields(
                { name: '📦 Total Key', value: Object.keys(keys).length.toString(), inline: true },
                { name: '✅ Key Aktif', value: active.toString(), inline: true },
                { name: '⚠️ Key Expired', value: expired.toString(), inline: true },
                { name: '🤖 Dari Discord', value: discordKeys.toString(), inline: true },
                { name: '🌐 Dari Web', value: webKeys.toString(), inline: true },
                { name: '📈 Active Rate', value: Object.keys(keys).length > 0 ? `${Math.round((active / Object.keys(keys).length) * 100)}%` : '0%', inline: true }
            )
            .setFooter({ text: 'StarSix License System • Updated Real-time' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    
    // Command /broadcast (Admin only)
    if (commandName === 'broadcast') {
        if (!isAdmin(member)) {
            return await interaction.reply({ 
                content: '⛔ Command ini hanya untuk Admin StarSix!', 
                ephemeral: true 
            });
        }
        
        const pesan = options.getString('pesan');
        await interaction.deferReply({ ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setColor(0xFF6B35)
            .setTitle('📢 ANNOUNCEMENT FROM STAR SIX')
            .setDescription(pesan)
            .setFooter({ text: `Announcement by ${user.tag}` })
            .setTimestamp();
        
        // Kirim ke channel umum (ganti dengan channel ID yang diinginkan)
        const channel = interaction.guild.channels.cache.find(ch => ch.name === 'general');
        if (channel) {
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: '✅ Pengumuman berhasil dikirim!', ephemeral: true });
        } else {
            await interaction.editReply({ 
                content: '⚠️ Channel "general" tidak ditemukan! Buat channel dengan nama "general"', 
                ephemeral: true 
            });
        }
    }
});

// ============ BOT READY ============

client.once('ready', async () => {
    console.log(`✅ StarSix Bot Online sebagai ${client.user.tag}`);
    console.log(`📊 Bot terhubung ke ${client.guilds.cache.size} server`);
    console.log(`🎮 StarSix License System Ready!`);
    
    // Register commands
    await registerCommands();
    
    // Set status bot
    client.user.setPresence({
        activities: [{ name: '/getkey | StarSix', type: 3 }],
        status: 'online'
    });
});

// Auto cleanup expired keys setiap 1 jam
setInterval(async () => {
    console.log('🧹 Cleaning expired keys...');
    const data = await fetchGistData();
    if (data?.keys) {
        const now = new Date();
        let changed = false;
        
        for (const [keyId, keyData] of Object.entries(data.keys)) {
            if (new Date(keyData.expire) <= now) {
                delete data.keys[keyId];
                changed = true;
            }
        }
        
        if (changed) {
            await updateGistData(data);
            console.log('✅ Expired keys cleaned!');
        }
    }
}, 60 * 60 * 1000); // Setiap 1 jam

// ============ JALANKAN BOT ============
client.login(DISCORD_TOKEN).catch(error => {
    console.error('❌ Gagal login:', error);
});
