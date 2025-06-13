const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "toxic",
    alias: ["roast", "savage"],
    use: '.toxic',
    desc: "Unleash Toxic-MD’s savage roast mode!",
    category: "fun",
    react: "😈",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const roasts = [
            "Yo, your Wi-Fi so weak it’s still connecting to 2005! 🥴",
            "I’d roast you harder, but your brain’s already fried! 💀",
            "You’re so slow, you got lapped by a dial-up modem! 😴",
            "Your vibes are giving ‘error 404: personality not found’! 🚫",
            "Toxic-MD’s got more drip than your entire existence! 💧",
            "You’re out here looking like a WhatsApp status nobody views! 👻"
        ];

        const reactionEmojis = ['😈', '🔥', '💀', '🖕', '⚡', '🚀', '💥'];
        const textEmojis = ['✨', '🎯', '⚡️', '🌟', '🌀', '🔱', '🛡️'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        await conn.sendMessage(from, { react: { text: textEmoji, key: mek.key } });

        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        await conn.sendMessage(from, {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ ${roast} ${reactionEmoji}
│❒ Bow to Toxic-MD, you noob! 😎
◈━━━━━━━━━━━━━━━━◈`,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: mek });

    } catch (e) {
        console.error("Toxic-MD toxic command error:", e);
        reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Yo, you broke Toxic-MD’s roast machine! Error: ${e.message} 😡
◈━━━━━━━━━━━━━━━━◈`);
    }
});
