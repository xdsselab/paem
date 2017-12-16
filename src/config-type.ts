export type DeepPartial<A> = { [K in keyof A]?: DeepPartial<A[K]> }

export interface Config {
  rules: Array<Rule>
}

export interface Rule {
  room: string
  delay: string
  replyInterval: string
  keywords: Array<string | RegExp>
  babies: Array<string | RegExp>
  nurses: Array<string | RegExp>
  replies: Array<string>
}
