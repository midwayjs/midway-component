/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { JsonResp } from '@waiting/shared-types'
import { globalTracer, FORMAT_HTTP_HEADERS } from 'opentracing'

import { TracerManager } from '../lib/tracer'
import { TracerConfig, TracerLog, TracerTag } from '../lib/types'
import { pathMatched } from '../util/common'

import {
  handleTopExceptionAndNext,
  processHTTPStatus,
  processResponseData,
} from './helper'


@Provide()
export class TracerMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return tracerMiddleware
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function tracerMiddleware(
  ctx: IMidwayWebContext<JsonResp | string>,
  next: IMidwayWebNext,
): Promise<unknown> {

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ctx.tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    return next()
  }

  const config = ctx.app.config.tracer as TracerConfig

  // 白名单内的路由不会被追踪
  if (pathMatched(ctx.path, config.whiteList)) {
    ctx.tracerManager = new TracerManager(false)
    return next()
  }
  const trm = startSpan(ctx)
  ctx.res.once('finish', () => {
    finishSpan(ctx).catch((ex) => {
      ctx.logger.error(ex)
    })
  })

  // return next()
  return handleTopExceptionAndNext(trm, next)
}

function startSpan(ctx: IMidwayWebContext<JsonResp | string>): TracerManager {
  // 开启第一个span并入栈
  const tracerManager = new TracerManager(true)
  const requestSpanCtx
    = globalTracer().extract(FORMAT_HTTP_HEADERS, ctx.headers) ?? undefined

  ctx.tracerManager = tracerManager

  tracerManager.startSpan(ctx.path, requestSpanCtx)
  tracerManager.addTags({
    [TracerTag.svcPid]: process.pid,
    [TracerTag.svcPpid]: process.ppid,
  })
  tracerManager.spanLog({
    event: TracerLog.requestBegin,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  return tracerManager
}

async function finishSpan(ctx: IMidwayWebContext<JsonResp | string>): Promise<void> {
  const { tracerManager } = ctx

  await processHTTPStatus(ctx)
  processResponseData(ctx)

  tracerManager.spanLog({
    event: TracerLog.requestEnd,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  tracerManager.finishSpan()
}
