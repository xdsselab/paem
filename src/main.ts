import { Wechaty } from 'wechaty'
import * as createDebug from 'debug'
import * as qrcode from 'qrcode-terminal'

import { readConfig } from './config'
import { createMessagesHandler } from './handlers'

const debug = createDebug('paem:main')

const wechaty = Wechaty.instance()

process.on('SIGINT', async () => {
  await wechaty.stop()
  debug('wechaty stopped')
  process.exit()
})

const main = async () => {
  const config = await readConfig()

  wechaty.on('error', e => debug('wechaty error: %O', e))

  wechaty.on('logout', user => debug('%s logout', user.name()))

  wechaty.on('login', user => debug('%s login', user.name()))

  wechaty.on('scan', (url, code) => {
    debug('scan qr code to login: %s', code)
    debug('%s', url)
    if (!/200|201/.test(String(code))) {
      qrcode.generate(url.replace(/\/qrcode\//, '/l/'))
    }
  })

  wechaty.on('message', createMessagesHandler(config))

  await wechaty.start()

  debug('wechaty started')
}

main().catch(async e => {
  debug('error in main: %O', e)
  await wechaty.stop()
  process.exit(-1)
})
