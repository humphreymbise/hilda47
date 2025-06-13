const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    use: '.ping',
    desc: "Check how fast Toxic-MD slaps back!",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        await conn.sendMessage(from, { react: { text: textEmoji, key: mek.key } });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        await conn.sendMessage(from, {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ Yo, Toxic-MD’s speed is ${responseTime.toFixed(2)}s! Faster than your Wi-Fi, noob! ${reactionEmoji}
◈━━━━━━━━━━━━━━━━◈`,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: mek });

    } catch (e) {
        console.error("Toxic-MD ping error:", e);
        reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Bot’s choking, fix your trash code! Error: ${e.message} 😡
◈━━━━━━━━━━━━━━━━◈`);
    }
});

cmd({
    pattern: "ping2",
    desc: "Test Toxic-MD’s quantum reflexes!",
    category: "main",
    react: "🍂",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now();
        const message = await conn.sendMessage(from, { text: '*PINGING THE VOID...*' });
        const endTime = Date.now();
        const ping = endTime - startTime;

        await conn.sendMessage(from, {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ Toxic-MD’s quantum speed: ${ping}ms! Blink and you’re roasted! 🔥
◈━━━━━━━━━━━━━━━━◈`
        }, { quoted: message });

    } catch (e) {
        console.error("Toxic-MD ping2 error:", e);
        reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Ping2 flopped hard! Error: ${e.message} 🥴
◈━━━━━━━━━━━━━━━━◈`);
    }
});
