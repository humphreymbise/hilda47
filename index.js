"use strict";

/* ----------------- MODULE IMPORTS ----------------- */
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const chalk = require('chalk');
const PhoneNumber = require('awesome-phonenumber');
const { Boom } = require('@hapi/boom');
const figlet = require('figlet');
const axios = require('axios');
const fetch = require('node-fetch');
const { exec, spawn, execSync } = require("child_process");
const NodeCache = require('node-cache');
const moment = require('moment-timezone');
const readline = require("readline");
const { color } = require('./lib/color');

const { writeExif } = require('./exif'); // adjust path if needed
const { writeExifImg, writeExifVid, imageToWebp, videoToWebp } = require('./lib/convert'); // adjust path if needed
const { getBuffer, getSizeMedia, getGroupAdmins } = require('./lib/functions');

const config = require('./config');
const Events = require('./action/events');
const sms = require('./lib/sms');
const { serialize } = require("./lib/serialize");
const {
  isAdmin,
  groupAdmins,
  parseJid,
  getAdmin,
  getBuffer: getBuff
} = require("./data");

const { state, saveState } = useSingleFileAuthState('./session.json');

/* ----------------- ASCII BANNER ----------------- */
function banner(text) {
  return figlet.textSync(text, {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 100,
    whitespaceBreak: true
  });
}

/* ----------------- MAIN CONNECTION ----------------- */
async function connectToWA() {
  const { version } = await fetchLatestBaileysVersion();
  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: state,
    version
  });

  /* Create and bind store */
  const store = makeInMemoryStore({});
  store.bind(conn.ev);

  console.log(banner('PK-XMD'));
  console.log("Starting...");

  /* ----------------- CONNECTION HANDLER ----------------- */
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to', lastDisconnect.error, 'Reconnecting:', shouldReconnect);

      if (shouldReconnect) {
        connectToWA();
      }
    } else if (connection === 'open') {
      conn.sendMessage(conn.user.id, {
        image: { url: `https://files.catbox.moe/e6rhto.jpg` },
        caption: `*🎉 Successfully Connected To PK-XMD (Beta Version) 🎉*`
      });
      console.log('Connected to WhatsApp');
    }
  });

  conn.ev.on('creds.update', saveState);

  /* ----------------- MESSAGE HANDLER ----------------- */
  conn.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const mek = messages[0];
      if (!mek.message) return;

      const m = await sms(conn, mek, store);
      if (!m.message) return;

      const body =
        m.mtype === 'conversation' ? m.message.conversation :
          m.mtype === 'imageMessage' ? m.message.imageMessage.caption :
            m.mtype === 'videoMessage' ? m.message.videoMessage.caption :
              m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                m.mtype === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                  m.mtype === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                    m.mtype === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                      '';

      const isCmd = body.startsWith(config.prefix);
      const command = isCmd ? body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);

      // Run events
      Events(conn, m, store);

    } catch (err) {
      console.log(err);
    }
  });

  /* ----------------- DELETE HANDLER ----------------- */
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        console.log("Delete Detected:", JSON.stringify(update, null, 2));
        await AntiDelete(conn, update); // fixed param
      }
    }
  });

  /* ----------------- UTILITIES ----------------- */
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
    }
    return jid;
  };

  conn.getName = (jid, withoutContact = false) => {
    jid = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v;
    if (jid.endsWith('@g.us')) {
      return new Promise(async (resolve) => {
        v = store.contacts[jid] || {};
        if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {};
        resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'));
      });
    } else {
      v = jid === '0@s.whatsapp.net' ? {
        id: jid,
        name: 'WhatsApp'
      } : jid === conn.decodeJid(conn.user.id) ? conn.user :
        (store.contacts[jid] || {});
      return v.name || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
    }
  };

  /* Send utilities */
  conn.sendFile = async (jid, media, options = {}) => {
    let mime = (await FileType.fromBuffer(media))?.mime;
    let pathFile = '';
    if (/image|video|sticker/.test(mime)) {
      pathFile = await writeExif(media, { packname: config.packname, author: config.author });
    }
    await conn.sendMessage(jid, { [mime.split('/')[0]]: { url: pathFile || media }, ...options });
    return pathFile;
  };

  conn.sendMedia = async (jid, path, fileName, options = {}) => {
    let res = await axios.get(path, { responseType: 'arraybuffer' });
    let data = Buffer.from(res.data, 'binary');
    if (res && res.status !== 200) {
      try { throw { json: JSON.parse(data.toString()) } } catch (e) { if (e.json) throw e.json }
    }
    await conn.sendMessage(jid, { document: data, fileName, mimetype: options.mimetype || 'application/pdf' }, { ...options });
  };

  /* Serialize */
  conn.serializeM = mek => sms(conn, mek, store);

  return conn;
}

/* ----------------- START ----------------- */
connectToWA();
