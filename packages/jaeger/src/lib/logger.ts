import { Context } from '@midwayjs/core'
import {
  Inject,
  Logger as _Logger,
  Provide,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import type { Span } from 'opentracing'

import { LogInfo, SpanLogInput } from './types'


/**
 * 自定义 Context Logger
 * - 封装 contextLogger & jaeger spanLog
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class Logger implements ILogger {
  @Inject() protected readonly ctx: Context

  @_Logger() protected readonly logger: ILogger

  debug(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'debug',
      msg,
      args,
    })
  }

  info(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'info',
      msg,
      args,
    })
  }

  warn(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'warn',
      msg,
      args,
    })
  }

  error(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'error',
      msg,
      args,
    })
  }

  log(info: SpanLogInput | LogInfo, span?: Span): void {
    const currSpan = span ? span : this.ctx.tracerManager.currentSpan()
    tracerLogger(this.logger, info, currSpan)
  }
}

function tracerLogger(
  logger: ILogger,
  info: SpanLogInput | LogInfo,
  span?: Span,
): void {

  const { msg, args } = info
  const level = (info.level ? info.level : 'info') as LogInfo['level']

  span?.log(info)

  if (typeof msg === 'undefined') {
    logger[level](info)
  }
  else if (Array.isArray(args)) {
    logger[level](msg, ...args)
  }
  else {
    logger[level](msg)
  }
}


// interface ILogger extends IMidwayLogger {
//   info(msg: unknown, ...args: unknown[]): void
//   debug(msg: unknown, ...args: unknown[]): void
//   error(msg: unknown, ...args: unknown[]): void
//   warn(msg: unknown, ...args: unknown[]): void
// }
