// Credits: xh_clinton
const fs = require('fs')
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' })

function convertToBool(text, fault = 'true') {
  return text === fault ? true : false
}

module.exports = {
  SESSION_ID: process.env.SESSION_ID || 'YOUR_SESSION_ID', // Add your base64 session ID
  AUTO_STATUS_SEEN: convertToBool(process.env.AUTO_STATUS_SEEN, 'true'), // Auto view status
  AUTO_STATUS_REPLY: convertToBool(process.env.AUTO_STATUS_REPLY, 'false'), // Auto reply on status
  AUTO_STATUS_REACT: convertToBool(process.env.AUTO_STATUS_REACT, 'true'), // Auto react on status
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || '*SEEN YOUR STATUS BY TOXIC-MD 😈*', // Status reply message
  WELCOME: convertToBool(process.env.WELCOME, 'true'), // Welcome/goodbye messages in groups
  ADMIN_EVENTS: convertToBool(process.env.ADMIN_EVENTS, 'false'), // Notify admin actions
  ANTI_LINK: convertToBool(process.env.ANTI_LINK, 'true'), // Anti-link for groups
  MENTION_REPLY: convertToBool(process.env.MENTION_REPLY, 'false'), // Auto voice reply on mentions
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || 'https://files.catbox.moe/og4tsk.jpg', // Menu image
  PREFIX: process.env.PREFIX || '.', // Command prefix
  BOT_NAME: process.env.BOT_NAME || 'Toxic-MD', // Bot name
  STICKER_NAME: process.env.STICKER_NAME || 'Toxic-MD', // Sticker pack name
  CUSTOM_REACT: convertToBool(process.env.CUSTOM_REACT, 'false'), // Custom emoji react
  CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || '😈,💀,🔥,🖕', // Custom react emojis
  DELETE_LINKS: convertToBool(process.env.DELETE_LINKS, 'false'), // Auto delete links
  OWNER_NUMBER: process.env.OWNER_NUMBER || '254735342808,254799283147', // Owner numbers
  OWNER_NAME: process.env.OWNER_NAME || 'xh_clinton', // Owner name
  DESCRIPTION: process.env.DESCRIPTION || '*© Powered by xh_clinton*', // Bot description
  ALIVE_IMG: process.env.ALIVE_IMG || 'https://files.catbox.moe/og4tsk.jpg', // Alive message image
  LIVE_MSG: process.env.LIVE_MSG || '> AM ACTIVE *TOXIC-MD* 😈', // Alive message
  READ_MESSAGE: convertToBool(process.env.READ_MESSAGE, 'false'), // Auto read messages
  AUTO_REACT: convertToBool(process.env.AUTO_REACT, 'false'), // Auto react on all messages
  ANTI_BAD: convertToBool(process.env.ANTI_BAD, 'false'), // Anti bad words
  MODE: process.env.MODE || 'public', // Bot mode (public/private/inbox/groups)
  ANTI_LINK_KICK: convertToBool(process.env.ANTI_LINK_KICK, 'false'), // Kick on links
  AUTO_VOICE: convertToBool(process.env.AUTO_VOICE, 'false'), // Auto voice messages
  AUTO_STICKER: convertToBool(process.env.AUTO_STICKER, 'false'), // Auto stickers
  AUTO_REPLY: convertToBool(process.env.AUTO_REPLY, 'false'), // Auto text reply
  ALWAYS_ONLINE: convertToBool(process.env.ALWAYS_ONLINE, 'true'), // Always online
  PUBLIC_MODE: convertToBool(process.env.PUBLIC_MODE, 'true'), // Public mode
  AUTO_TYPING: convertToBool(process.env.AUTO_TYPING, 'false'), // Auto typing
  READ_CMD: convertToBool(process.env.READ_CMD, 'false'), // Mark commands as read
  DEV: process.env.DEV || '254735342808', // Developer number
  ANTI_VV: convertToBool(process.env.ANTI_VV, 'true'), // Anti view once
  ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || 'log', // Anti-delete message path
  AUTO_RECORDING: convertToBool(process.env.AUTO_RECORDING, 'false'), // Auto recording
  ANTICALL: convertToBool(process.env.ANTICALL, 'false'), // Anti call
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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'
}
