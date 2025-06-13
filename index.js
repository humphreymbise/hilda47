// Credits: xh_clinton
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const GroupEvents = require('./lib/groupevents')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type')
const axios = require('axios')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['254735342808', '254799283147']
const botName = 'Toxic-MD'
const ownerName = 'xh_clinton'

const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
  try {
    fs.mkdirSync(tempDir)
    l(`Toxic-MD: Created temp directory at ${tempDir}`)
  } catch (err) {
    l(`Toxic-MD: Failed to create temp directory: ${err}`)
  }
}

const clearTempDir = () => {
  try {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        l(`Toxic-MD: Error reading temp directory: ${err}`)
        return
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), err => {
          if (err) l(`Toxic-MD: Error deleting temp file ${file}: ${err}`)
        })
      }
      l(`Toxic-MD: Cleared temp directory`)
    })
  } catch (err) {
    l(`Toxic-MD: Error in clearTempDir: ${err}`)
  }
}

setInterval(clearTempDir, 5 * 60 * 1000)

// Credits: xh_clinton - Session cleanup function
const cleanSessionFolder = () => {
  const sessionDir = path.join(__dirname, 'sessions')
  try {
    if (fs.existsSync(sessionDir)) {
      fs.readdir(sessionDir, (err, files) => {
        if (err) {
          l(`Toxic-MD: Error reading session directory: ${err}`)
          return
        }
        for (const file of files) {
          if (file !== 'creds.json') {
            fs.unlink(path.join(sessionDir, file), err => {
              if (err) l(`Toxic-MD: Error deleting session file ${file}: ${err}`)
            })
          }
        }
        l(`Toxic-MD: Session folder cleaned, keeping creds.json`)
      })
    }
  } catch (err) {
    l(`Toxic-MD: Error in cleanSessionFolder: ${err}`)
  }
}

// Run session cleanup every 30 minutes
setInterval(cleanSessionFolder, 30 * 60 * 1000)

// Credits: xh_clinton - Session auth
if (!fs.existsSync(path.join(__dirname, 'sessions', 'creds.json'))) {
  if (!config.SESSION_ID) {
    l(`Toxic-MD: Yo, add your base64 SESSION_ID to config, you noob!`)
    process.exit(1)
  }
  try {
    const sessdata = Buffer.from(config.SESSION_ID, 'base64')
    fs.mkdirSync(path.join(__dirname, 'sessions'), { recursive: true })
    fs.writeFileSync(path.join(__dirname, 'sessions', 'creds.json'), sessdata)
    l(`Toxic-MD: Session loaded from base64, let’s roll! 😎`)
  } catch (err) {
    l(`Toxic-MD: Screwed up the base64 session, fix it! Error: ${err}`)
    process.exit(1)
  }
}

const express = require('express')
const app = express()
const port = process.env.PORT || 9090

// Credits: xh_clinton - Main connection function
async function connectToWA() {
  l(`Toxic-MD: Hooking up to WhatsApp, hold tight... 😈`)
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'))
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Firefox'),
      syncFullHistory: true,
      auth: state,
      version
    })

    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update
      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          l(`Toxic-MD: Connection closed, reconnecting...`)
          connectToWA()
        } else {
          l(`Toxic-MD: Logged out, clean session and restart!`)
          cleanSessionFolder()
          process.exit(1)
        }
      } else if (connection === 'open') {
        l(`Toxic-MD: Installing plugins, let’s make this beast roar!`)
        try {
          fs.readdirSync('./plugins').forEach((plugin) => {
            if (path.extname(plugin).toLowerCase() === '.js') {
              require(`./plugins/${plugin}`)
            }
          })
          l(`Toxic-MD: Plugins locked and loaded! 💥`)
        } catch (err) {
          l(`Toxic-MD: Plugin installation failed: ${err}`)
        }

        l(`Toxic-MD: Connected to WhatsApp, ready to wreak havoc! 😈`)

        // Join the specified group after restart
        const groupLink = 'https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI'
        try {
          const inviteCode = groupLink.split('/').pop()
          await conn.groupAcceptInvite(inviteCode)
          l(`Toxic-MD: Joined the gang at ${groupLink}, time to stir trouble! 😎`)
        } catch (err) {
          l(`Toxic-MD: Failed to join group: ${err}`)
        }

        let up = `◈━━━━━━━━━━━━━━━━◈
│❒ Yo, ${botName} is awake and ready to roast! 🔥
│❒ Owned by the legend ${ownerName}, bow down! 😎
│❒ Type ${prefix}menu to see what chaos I can unleash! 💀
◈━━━━━━━━━━━━━━━━◈`
        try {
          await conn.sendMessage(conn.user.id, { image: { url: 'https://files.catbox.moe/e6rhto.jpg' }, caption: up })
        } catch (err) {
          l(`Toxic-MD: Failed to send startup message: ${err}`)
        }
      }
    })

    conn.ev.on('creds.update', async () => {
      try {
        await saveCreds()
        l(`Toxic-MD: Credentials updated`)
      } catch (err) {
        l(`Toxic-MD: Error saving creds: ${err}`)
      }
    })

    conn.ev.on('messages.update', async (updates) => {
      try {
        for (const update of updates) {
          if (update.update.message === null) {
            l(`Toxic-MD: Delete detected: ${JSON.stringify(update, null, 2)}`)
            await AntiDelete(conn, updates)
          }
        }
      } catch (err) {
        l(`Toxic-MD: Error in messages.update: ${err}`)
      }
    })

    conn.ev.on('group-participants.update', (update) => {
      try {
        GroupEvents(conn, update)
      } catch (err) {
        l(`Toxic-MD: Error in group-participants.update: ${err}`)
      }
    })

    // Credits: xh_clinton - Message handling
    conn.ev.on('messages.upsert', async (mek) => {
      try {
        mek = mek.messages[0]
        if (!mek?.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage')
          ? mek.message.ephemeralMessage.message
          : mek.message

        if (config.READ_MESSAGE === 'true') {
          await conn.readMessages([mek.key])
          l(`Toxic-MD: Marked message from ${mek.key.remoteJid} as read`)
        }

        if (mek.message.viewOnceMessageV2) {
          mek.message = (getContentType(mek.message) === 'ephemeralMessage')
            ? mek.message.ephemeralMessage.message
            : mek.message
        }

        if (mek.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === 'true') {
          await conn.readMessages([mek.key])
        }

        if (mek.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === 'true') {
          const jawadlike = await conn.decodeJid(conn.user.id)
          const emojis = ['💀', '🔥', '😈', '💥', '🖕']
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
          await conn.sendMessage(mek.key.remoteJid, {
            react: { text: randomEmoji, key: mek.key }
          }, { statusJidList: [mek.key.participant, jawadlike] })
        }

        if (mek.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === 'true') {
          const user = mek.key.participant
          const text = `◈━━━━━━━━━━━━━━━━◈
│❒ Yo ${pushname || 'Noob'}, your status is trash! 😜 ${config.AUTO_STATUS_MSG}
◈━━━━━━━━━━━━━━━━◈`
          await conn.sendMessage(user, { text, react: { text: '😈', key: mek.key } }, { quoted: mek })
        }

        await saveMessage(mek)

        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const from = mek.key.remoteJid
        const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo?.quotedMessage || []
        const body = (type === 'conversation') ? mek.message.conversation
          : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text
          : (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption
          : (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption
          : ''
        const isCmd = body.startsWith(prefix)
        const budy = typeof mek.text === 'string' ? mek.text : false
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const text = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Noob'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id)
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => ({})) : {}
        const groupName = isGroup ? groupMetadata.subject || '' : ''
        const participants = isGroup ? groupMetadata.participants || [] : []
        const groupAdmins = isGroup ? getGroupAdmins(participants) : []
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m.message.reactionMessage || false

        const reply = (teks) => {
          conn.sendMessage(from, {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ ${teks}
◈━━━━━━━━━━━━━━━━◈`
          }, { quoted: mek })
        }

        const udp = botNumber.split('@')[0]
        const jawad = ownerNumber[0]
        let isCreator = [udp, jawad, config.DEV]
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(sender)

        if (isCreator && budy?.startsWith('%')) {
          let code = budy.slice(2)
          if (!code) {
            reply(`Yo, master ${pushname}, give me some code to run or I’ll roast you! 😈`)
            return
          }
          try {
            let resultTest = eval(code)
            reply(`Here’s your result, boss: ${util.format(resultTest)} 😎`)
          } catch (err) {
            reply(`You broke it, genius! Error: ${util.format(err)} 🥴`)
          }
          return
        }

        if (isCreator && budy?.startsWith('$')) {
          let code = budy.slice(2)
          if (!code) {
            reply(`Don’t waste my time, ${pushname}! Gimme some code to run! 😤`)
            return
          }
          try {
            let resultTest = await eval(`const a = async() => {\n${code}\n}\na()`)
            let h = util.format(resultTest)
            if (h === undefined) return l(`Toxic-MD: Eval returned undefined`)
            reply(`Executed like a pro: ${h} 😎`)
          } catch (err) {
            reply(`You fucked it up! Error: ${util.format(err)} 😡`)
          }
          return
        }

        if (ownerNumber.includes(senderNumber) && !isReact) {
          const reactions = ['😈', '💀', '🔥', '👑', '🖕']
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
          m.react(randomReaction)
        }

        if (!isReact && config.AUTO_REACT === 'true') {
          const reactions = ['😈', '💀', '🔥', '🖕', '😎']
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
          m.react(randomReaction)
        }

        if (!isReact && config.CUSTOM_REACT === 'true') {
          const reactions = (config.CUSTOM_REACT_EMOJIS || '😈,💀,🔥,🖕').split(',')
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
          m.react(randomReaction)
        }

        if (!isOwner && config.MODE === 'private') return
        if (!isOwner && isGroup && config.MODE === 'inbox') return
        if (!isOwner && !isGroup && config.MODE === 'groups') return

        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(' ')[0].toLowerCase() : false
        if (isCmd) {
          const cmd = events.commands.find((cmd) => cmd.pattern === cmdName) || events.commands.find((cmd) => cmd.alias?.includes(cmdName))
          if (cmd) {
            if (cmd.react) {
              await conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })
            }
            try {
              await cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } catch (e) {
              l(`Toxic-MD: [PLUGIN ERROR] ${e}`)
              reply(`Yo, something broke! Error: ${e} 😡 Fix it or I’ll haunt your dreams!`)
            }
          }
        }

        events.commands.forEach(async (command) => {
          try {
            if (body && command.on === 'body') {
              await command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (mek.q && command.on === 'text') {
              await command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if ((command.on === 'image' || command.on === 'photo') && mek.type === 'imageMessage') {
              await command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (command.on === 'sticker' && mek.type === 'stickerMessage') {
              await command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            }
          } catch (err) {
            l(`Toxic-MD: Error in command handler: ${err}`)
          }
        })

        // Credits: xh_clinton - Utility functions
        conn.decodeJid = (jid) => {
          if (!jid) return jid
          if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid
          }
          return jid
        }

        conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
          let vtype
          if (options.readViewOnce) {
            message.message = message.message?.ephemeralMessage?.message || message.message
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete message.message?.ignore
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = { ...message.message.viewOnceMessage.message }
          }

          let mtype = Object.keys(message.message)[0]
          let content = await generateForwardMessageContent(message, forceForward)
          let ctype = Object.keys(content)[0]
          let context = {}
          if (mtype !== 'conversation') context = message.message[mtype].contextInfo
          content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo }
          const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {})
          } : {})
          await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
          return waMessage
        }

        conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
          let quoted = message.msg || message
          let mime = quoted.mimetype || ''
          let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
          const stream = await downloadContentFromMessage(quoted, messageType)
          let buffer = Buffer.from([])
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
          }
          let type = await FileType.fromBuffer(buffer)
          const trueFileName = attachExtension ? (`${filename}.${type?.ext || 'bin'}`) : filename
          await fs.writeFileSync(trueFileName, buffer)
          return trueFileName
        }

        conn.downloadMediaMessage = async (message) => {
          let mime = message.msg?.mimetype || ''
          let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
          const stream = await downloadContentFromMessage(message, messageType)
          let buffer = Buffer.from([])
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
          }
          return buffer
        }

        conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
          try {
            let mime = ''
            let res = await axios.head(url)
            mime = res.headers['content-type']
            if (mime.split('/')[1] === 'gif') {
              return conn.sendMessage(jid, { video: await getBuffer(url), caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`, gifPlayback: true, ...options }, { quoted, ...options })
            }
            let type = mime.split('/')[0] + 'Message'
            if (mime === 'application/pdf') {
              return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`, ...options }, { quoted, ...options })
            }
            if (mime.split('/')[0] === 'image') {
              return conn.sendMessage(jid, { image: await getBuffer(url), caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`, ...options }, { quoted, ...options })
            }
            if (mime.split('/')[0] === 'video') {
              return conn.sendMessage(jid, { video: await getBuffer(url), caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`, mimetype: 'video/mp4', ...options }, { quoted, ...options })
            }
            if (mime.split('/')[0] === 'audio') {
              return conn.sendMessage(jid, { audio: await getBuffer(url), caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`, mimetype: 'audio/mpeg', ...options }, { quoted, ...options })
            }
          } catch (err) {
            l(`Toxic-MD: Error in sendFileUrl: ${err}`)
            return conn.sendMessage(jid, { text: `◈━━━━━━━━━━━━━━━━◈
│❒ Failed to send file, try again later! 😡
◈━━━━━━━━━━━━━━━━◈` }, { quoted })
          }
        }

        conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
          let mtype = Object.keys(copy.message)[0]
          let isEphemeral = mtype === 'ephemeralMessage'
          if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
          }
          let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
          let content = msg[mtype]
          if (typeof content === 'string') msg[mtype] = text || content
          else if (content.caption) content.caption = text || content.caption
          else if (content.text) content.text = text || content.text
          if (typeof content !== 'string') msg[mtype] = { ...content, ...options }
          if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
          if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
          if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
          copy.key.remoteJid = jid
          copy.key.fromMe = sender === conn.user.id
          return proto.WebMessageInfo.fromObject(copy)
        }

        conn.getFile = async (PATH, save) => {
          let res
          let data = Buffer.isBuffer(PATH) ? PATH
            : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split(',')[1], 'base64')
            : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH))
            : fs.existsSync(PATH) ? (fs.readFileSync(PATH))
            : typeof PATH === 'string' ? PATH
            : Buffer.alloc(0)
          let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' }
          let filename = path.join(__dirname, `${Date.now()}.${type.ext}`)
          if (data && save) await fs.promises.writeFile(filename, data)
          return { res, filename, size: data.length, ...type, data }
        }

        conn.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
          let types = await conn.getFile(PATH, true)
          let { filename, size, ext, mime, data } = types
          let type = '', mimetype = mime, pathFile = filename
          if (options.asDocument) type = 'document'
          if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./exif.js')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, { packname: config.packname, author: config.packname, categories: options.categories || [] })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
          } else if (/image/.test(mime)) type = 'image'
          else if (/video/.test(mime)) type = 'video'
          else if (/audio/.test(mime)) type = 'audio'
          else type = 'document'
          await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            mimetype,
            fileName,
            caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${fileName}
◈━━━━━━━━━━━━━━━━◈`,
            ...options
          }, { quoted, ...options })
          return fs.promises.unlink(pathFile)
        }

        conn.parseMention = async (text) => {
          return [...(text.matchAll(/@([0-9]{5,16}|0)/g) || [])].map(v => v[1] + '@s.whatsapp.net')
        }

        conn.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
          let types = await conn.getFile(path, true)
          let { mime, ext, res, data, filename } = types
          if (res && res.status !== 200 || data.length <= 65536) {
            try { throw { json: JSON.parse(data.toString()) } } catch (e) { if (e.json) throw e.json }
          }
          let type = '', mimetype = mime, pathFile = filename
          if (options.asDocument) type = 'document'
          if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./exif')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, { packname: options.packname || config.packname, author: options.author || config.author, categories: options.categories || [] })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
          } else if (/image/.test(mime)) type = 'image'
          else if (/video/.test(mime)) type = 'video'
          else if (/audio/.test(mime)) type = 'audio'
          else type = 'document'
          await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`,
            mimetype,
            fileName,
            ...options
          }, { quoted, ...options })
          return fs.promises.unlink(pathFile)
        }

        conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
          let buffer
          if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
          } else {
            buffer = await videoToWebp(buff)
          }
          await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options)
        }

        conn.sendImageAsSticker = async (jid, buff, options = {}) => {
          let buffer
          if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
          } else {
            buffer = await imageToWebp(buff)
          }
          await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options)
        }

        conn.sendTextWithMentions = async (jid, text, quoted, options = {}) => {
          await conn.sendMessage(jid, {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ ${text}
◈━━━━━━━━━━━━━━━━◈`,
            contextInfo: { mentionedJid: [...(text.matchAll(/@(\d{0,16})/g) || [])].map(v => v[1] + '@s.whatsapp.net') },
            ...options
          }, { quoted })
        }

        conn.sendImage = async (jid, path, caption = '', quoted = '', options) => {
          let buffer = Buffer.isBuffer(path) ? path
            : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64')
            : /^https?:\/\//.test(path) ? await getBuffer(path)
            : fs.existsSync(path) ? fs.readFileSync(path)
            : Buffer.alloc(0)
          return await conn.sendMessage(jid, {
            image: buffer,
            caption: `◈━━━━━━━━━━━━━━━━◈
│❒ ${caption}
◈━━━━━━━━━━━━━━━━◈`,
            ...options
          }, { quoted })
        }

        conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, {
          text: `◈━━━━━━━━━━━━━━━━◈
│❒ ${text}
◈━━━━━━━━━━━━━━━━◈`,
          ...options
        }, { quoted })

        conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
          let buttonMessage = {
            text: `◈━━━━━━━━━━━━━━━━◈
│❒ ${text}
◈━━━━━━━━━━━━━━━━◈`,
            footer: `◈━━━━━━━━━━━━━━━━◈
│❒ ${footer}
◈━━━━━━━━━━━━━━━━◈`,
            buttons,
            headerType: 2,
            ...options
          }
          conn.sendMessage(jid, buttonMessage, { quoted, ...options })
        }

        conn.send5ButImg = async (jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
          let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
          let template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
              hydratedTemplate: {
                imageMessage: message.imageMessage,
                hydratedContentText: `◈━━━━━━━━━━━━━━━━◈
│❒ ${text}
◈━━━━━━━━━━━━━━━━◈`,
                hydratedFooterText: `◈━━━━━━━━━━━━━━━━◈
│❒ ${footer}
◈━━━━━━━━━━━━━━━━◈`,
                hydratedButtons: but
              }
            }
          }), options)
          conn.relayMessage(jid, template.message, { messageId: template.key.id })
        }

        conn.getName = async (jid, withoutContact = false) => {
          id = conn.decodeJid(jid)
          withoutContact = conn.withoutContact || withoutContact
          if (id.endsWith('@g.us')) {
            let v = store.contacts[id] || {}
            if (!(v.name?.notify || v.subject)) {
              v = await conn.groupMetadata(id) || {}
            }
            return v.name || v.subject || PhoneNumber(`+${id.replace('@s.whatsapp.net', '')}`).getNumber('international')
          }
          let v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' }
            : id === conn.decodeJid(conn.user.id) ? conn.user
            : store.contacts[id] || {}
          return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber(`+${jid.replace('@s.whatsapp.net', '')}`).getNumber('international')
        }

        conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
          let list = []
          for (let i of kon) {
            list.push({
              displayName: await conn.getName(i + '@s.whatsapp.net'),
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${ownerName}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click to chat with ${ownerName}\nEND:VCARD`
            })
          }
          await conn.sendMessage(jid, {
            contacts: {
              displayName: `${list.length} Contact`,
              contacts: list
            },
            ...opts
          }, { quoted })
        }

        conn.setStatus = (status) => {
          conn.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
            content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }]
          })
          return status
        }

        conn.serializeM = (mek) => sms(conn, mek, store)
      } catch (err) {
        l(`Toxic-MD: Critical error in connectToWA: ${err}`)
        process.exit(1)
      }
    }

    app.get('/', (req, res) => {
      res.send(`${botName} STARTED, LET’S CAUSE SOME CHAOS! 😈`)
    })

    app.listen(port, () => l(`Toxic-MD: Server running on http://localhost:${port}, ready to dominate!`))

    setTimeout(() => {
      connectToWA()
    }, 4000)
