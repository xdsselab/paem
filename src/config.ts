import { promisify } from 'util'
import * as createDebug from 'debug'
import { join, resolve } from 'path'
import { exists, realpath } from 'fs'
import { DeepPartial, Config, Rule } from './config-type'

const debug = createDebug('paem:config')

const resolveConfig = async (prefix: string, postfixes: Array<string>) => {

  const cwd = await promisify(realpath)(process.cwd())

  for (const postfix of postfixes) {
    const path = prefix + postfix
    if (await promisify(exists)(resolve(cwd, path))) {
      return join('..', path)
    }
  }

  throw new Error(`missing config file: '${prefix + postfixes[0]}'`)
}

export const readConfig = async (): Promise<Config> => {

  const postfixes = ['.prod.ts', '.ts', '.json']

  const rulesConfigPath = await resolveConfig('config/rules', postfixes)

  const rules = (await import(rulesConfigPath)).default as Array<Rule>

  const config: Config = {
    rules,
  }

  debug('current configuration:\n%s', JSON.stringify(config, undefined, 2))

  return config
}
