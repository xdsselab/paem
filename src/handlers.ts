import ms = require('ms')
import * as createDebug from 'debug'
import { Message, MsgType } from 'wechaty'
import { Config } from './config-type'

const debug = createDebug('paem:handlers')

/** in milliseconds */
let lastReplyTime = Date.now()

const matchString = (target: string, matchers: Array<string | RegExp>) =>
  matchers.some(
    matcher =>
      typeof matcher === 'string'
        ? target.includes(matcher)
        : matcher.test(target),
  )

const senderOf = (message: Message) => {
  const room = message.room()
  return (
    (room && room.alias(message.from())) ||
    message.from().alias() ||
    message.from().name()
  )
}

const printMessage = (message: Message, content?: string) => {
  const room = message.room()
  if (room) {
    debug(
      '[M] (%s) %s: %s',
      room.topic(),
      senderOf(message),
      content || message.content(),
    )
  } else {
    debug('[M] %s: %s', senderOf(message), content || message.content())
  }
}

const count = (() => {
  let c = -1
  return () => {
    return (c += 1)
  }
})()

const takeCareOf = async (
  baby: string,
  message: Message,
  replies: Array<string>,
) => {
  const reply = replies[count() % replies.length]
  await message.say(reply)
}

export const createMessagesHandler = (config: Config) => (message: Message) => {
  if (message.type() !== MsgType.TEXT) {
    printMessage(message, `<unsupported message type: ${message.type()}>`)
    return
  }

  const room = message.room()

  debug(
    'room && room.alias(message.from()) = %s',
    room && room.alias(message.from()),
  )
  debug('message.from().alias() = %s', message.from().alias())
  debug('message.from().name() = %s', message.from().name())

  printMessage(message)

  if (room) {
    const sender = senderOf(message)

    const rule = config.rules.find(rule => rule.room === room.topic())

    if (rule) {
      if (
        matchString(sender, rule.babies) &&
        matchString(message.content(), rule.keywords)
      ) {
        setTimeout(async () => {
          if (Date.now() - lastReplyTime > ms(rule.replyInterval)) {
            lastReplyTime = Date.now()
            await takeCareOf(sender, message, rule.replies)
          }
        }, ms(rule.delay))
      } else if (matchString(sender, rule.nurses)) {
        lastReplyTime = Date.now()
      }
    }
  }
}
