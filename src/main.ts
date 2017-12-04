import { Wechaty } from 'wechaty'
import * as createDebug from 'debug'
import * as qrcode from 'qrcode-terminal'

const debug = createDebug('paem:main')

const wechaty = Wechaty.instance()

process.on('SIGINT', async () => {
  await wechaty.stop()
  debug('wechaty stopped')
  process.exit()
})

const main = async () => {
  wechaty.on('error', e => debug('wechaty error: %O', e))

  wechaty.on('logout', user =>
    debug('%s logout', user.name())
  )

  wechaty.on('login', user =>
    debug('%s login', user.name())
  )

  wechaty.on('scan', (url, code) => {
    debug('scan qr code to login: %s', code)
    debug('%s', url)
    if (!/200|201/.test(String(code))) {
      qrcode.generate(url.replace(/\/qrcode\//, '/l/'))
    }
  })

  wechaty.on('message', message => {
    const room = message.room()
    if (room) {
      debug('[%s] %s: %s', room.topic(), message.from().name(), message.content())
    } else {
      debug('%s: %s', message.from().name(), message.content())
    }
  })

  await wechaty.start()

  debug('wechaty started')
}

main().catch(e => {
  debug('error in main: %O', e)
  wechaty.stop().catch(e => debug('error while stopping wechaty: %O', e))
  process.exit(-1)
})
