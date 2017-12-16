import { Rule } from '../src/config-type'

const rules: Array<Rule> = [
  {
    room: 'PAEM Developers',
    delay: '5s',
    replyInterval: '1m',
    keywords: [/paem|keyword/i],
    babies: ['[b]'],
    nurses: ['[n]'],
    replies: ['..'],
  },
]

export default rules
