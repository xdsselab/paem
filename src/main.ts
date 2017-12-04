import * as createDebug from 'debug'

const debug = createDebug('paem:main')

const main = async () => {
  debug('it works')
}

main().catch(e => console.error(e))
