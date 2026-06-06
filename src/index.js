import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    downloadMediaMessage,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_DIR = path.join(__dirname, '../auth_info')

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true })

const logger = pino({ level: 'silent' })

const MENU_TEXT = `🤖 *WA HD Bot*

📹 *Video HD Story*
Kirim video sebagai *Dokumen* + caption:
\`vidhd\`

🖼️ *Gambar HD Story*
Kirim gambar sebagai *Dokumen* + caption:
\`imghd\`

📌 *Cara pakai:*
1. Di WA, pilih file
2. Tap ikon Dokumen (📎) — *bukan galeri*
3. Tambah caption: \`vidhd\` atau \`imghd\`
4. Kirim ke nomor bot ini
5. Bot balas file HD-nya
6. Buka file → Share ke *Status WA*

⚠️ Wajib kirim sebagai *Dokumen*, bukan foto/video biasa`

async function connectToWA() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: false,
        browser: ['HD Bot', 'Chrome', '124.0.0'],
        markOnlineOnConnect: false
    })

    // Connection handler
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.clear()
            console.log('━'.repeat(50))
            console.log('  📱 Scan QR ini di WA:')
            console.log('  Perangkat Tertaut → Tautkan Perangkat Baru')
            console.log('━'.repeat(50))
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('\n✅ Bot berhasil terhubung ke WhatsApp!\n')
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            const loggedOut = code === DisconnectReason.loggedOut
            console.log(`⚠️  Koneksi terputus (code: ${code})`)
            if (loggedOut) {
                console.log('❌ Logged out. Hapus folder auth_info lalu restart.')
                fs.rmSync(AUTH_DIR, { recursive: true, force: true })
            } else {
                console.log('🔄 Reconnecting...')
                setTimeout(connectToWA, 3000)
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const msg of messages) {
            try {
                if (!msg.message || msg.key.fromMe) continue

                const from = msg.key.remoteJid
                const msgContent = msg.message

                // Detect message type
                const msgType = Object.keys(msgContent)[0]

                // Get caption/text
                const caption = (
                    msgContent?.documentMessage?.caption ||
                    msgContent?.imageMessage?.caption ||
                    msgContent?.videoMessage?.caption ||
                    msgContent?.conversation ||
                    msgContent?.extendedTextMessage?.text ||
                    ''
                ).toLowerCase().trim()

                // /menu atau /help
                if (['menu', '/menu', '/help', 'help', 'halo', 'hai', 'hi', 'hello'].includes(caption)) {
                    await sock.sendMessage(from, { text: MENU_TEXT })
                    continue
                }

                // vidhd — video HD
                if (caption.includes('vidhd')) {
                    if (msgType !== 'documentMessage') {
                        await sock.sendMessage(from, {
                            text: '❌ Kirim videonya sebagai *Dokumen* ya, bukan video biasa.\n\nCara: Attach → pilih ikon 📎 Dokumen'
                        }, { quoted: msg })
                        continue
                    }

                    const doc = msgContent.documentMessage
                    const mime = doc.mimetype || ''

                    if (!mime.startsWith('video/')) {
                        await sock.sendMessage(from, {
                            text: '❌ File bukan video. Pastikan kirim file video (mp4, mov, dll) sebagai dokumen.'
                        }, { quoted: msg })
                        continue
                    }

                    await sock.sendMessage(from, { text: '⏳ Sedang proses video HD...' })

                    const buffer = await downloadMediaMessage(
                        msg, 'buffer', {},
                        { logger, reuploadRequest: sock.updateMediaMessage }
                    )

                    const fileName = doc.fileName || `video_hd_${Date.now()}.mp4`

                    await sock.sendMessage(from, {
                        document: buffer,
                        mimetype: mime,
                        fileName: fileName,
                        caption: `✅ *Video HD siap!*\n\n📌 Cara upload ke Story:\n1. Tap & tahan dokumen ini\n2. Pilih *Forward*\n3. Pilih *My Status*\n\nAtau buka dokumen → tap ikon share → Status`
                    })

                    console.log(`[vidhd] Berhasil proses untuk ${from} — ${fileName}`)
                    continue
                }

                // imghd — gambar HD
                if (caption.includes('imghd')) {
                    if (msgType !== 'documentMessage') {
                        await sock.sendMessage(from, {
                            text: '❌ Kirim gambarnya sebagai *Dokumen* ya, bukan foto biasa.\n\nCara: Attach → pilih ikon 📎 Dokumen'
                        }, { quoted: msg })
                        continue
                    }

                    const doc = msgContent.documentMessage
                    const mime = doc.mimetype || ''

                    if (!mime.startsWith('image/')) {
                        await sock.sendMessage(from, {
                            text: '❌ File bukan gambar. Pastikan kirim file gambar (jpg, png, dll) sebagai dokumen.'
                        }, { quoted: msg })
                        continue
                    }

                    await sock.sendMessage(from, { text: '⏳ Sedang proses gambar HD...' })

                    const buffer = await downloadMediaMessage(
                        msg, 'buffer', {},
                        { logger, reuploadRequest: sock.updateMediaMessage }
                    )

                    const fileName = doc.fileName || `image_hd_${Date.now()}.jpg`

                    await sock.sendMessage(from, {
                        document: buffer,
                        mimetype: mime,
                        fileName: fileName,
                        caption: `✅ *Gambar HD siap!*\n\n📌 Cara upload ke Story:\n1. Tap & tahan dokumen ini\n2. Pilih *Forward*\n3. Pilih *My Status*\n\nAtau buka dokumen → tap ikon share → Status`
                    })

                    console.log(`[imghd] Berhasil proses untuk ${from} — ${fileName}`)
                    continue
                }

            } catch (err) {
                console.error('Error handle message:', err)
            }
        }
    })

    return sock
}

console.log('🚀 WA HD Bot starting...')
connectToWA().catch(console.error)
