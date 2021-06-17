import type { IncomingHttpHeaders } from 'http'

import type { ILogger } from '@midwayjs/logger'
import { IMidwayWebContext } from '@midwayjs/web'
import { KnownKeys } from '@waiting/shared-types'
import { TracingConfig } from 'jaeger-client'

import { TracerManager } from './tracer'


export interface TracerConfig {
  /**
   * 请求路径忽略名单
   * @default ['/favicon.ico', '/favicon.png']
   */
  whiteList: (string | RegExp)[]
  /**
   * 强制采样请求处理时间（毫秒）阈值，
   * 负数不采样
   */
  reqThrottleMsForPriority: number
  tracingConfig: TracingConfig
  /**
   * Use integrated tracer middleware,
   * set to false if custom tracer middleware enabled
   * @default true
   */
  enableMiddleWare: boolean
  /**
   * Catch and sample error,
   * set to false if other tracer middleware log the error
   * @default true
   */
  enableCatchError: boolean
  /**
   * - GET: request.query
   * - POST: request.body (only when content-type: 'application/json')
   * @default true
   */
  logginInputQuery: boolean
  /**
   * @default false
   */
  loggingOutputBody: boolean
  /**
   * @default ['authorization', 'user-agent']
   */
  loggingReqHeaders: string[] | KnownKeys<IncomingHttpHeaders>[]
  /**
	 * Callback to process custom failure
	 * @default helper.ts/processCustomFailure()
	 */
  processCustomFailure?: (
    ctx: IMidwayWebContext<any>,
    trm: TracerManager,
  ) => Promise<void>
}

export enum HeadersKey {
  /**
   * format: {trace-id}:{span-id}:{parent-span-id}:{flags}
   */
  traceId = 'uber-trace-id',
  reqId = 'x-request-id',
}

export enum TracerTag {
  logLevel = 'log.level',
  dbName = 'db',
  dbClient = 'db.client',
  dbHost = 'db.host',
  dbDatabase = 'db.database',
  dbPort = 'db.port',
  dbUser = 'db.user',
  dbCommand = 'db.command',
  callerClass = 'caller.class',

  httpUserAgent = 'http.user-agent',
  httpAuthorization = 'http.authorization',
  httpProtocol = 'http.protocol',
  reqId = 'reqId',
  svcIp4 = 'svc.ipv4',
  svcIp6 = 'svc.ipv6',
  svcException = 'svc.exception',
  svcName = 'svc.name',
  svcPid = 'svc.pid',
  svcPpid = 'svc.ppid',
  svcVer = 'svc.ver',
  resCode = 'res.code',
  message = 'message',
  reqQuery = 'req.query',
  reqBody = 'req.body',
  respBody = 'resp.body',
}

export enum TracerLog {
  logThrottleMs = 'log.throttle',
  exIsTraced = '__isTraced',
  topException = 'top-exp',

  error = 'error',
  requestBegin = 'tracer-request-begin',
  requestEnd = 'tracer-request-end',
  preProcessFinish = 'pre-process-finish',
  postProcessBegin = 'post-process-begin',

  fetchStart = 'fetch-start',
  fetchFinish = 'fetch-finish',
  fetchException = 'fetch-exception',

  queryResponse = 'query-response',
  queryError = 'error',
  queryStart = 'query-start',
  queryFinish = 'query-finish',
  queryRowCount = 'row-count',
  queryCost = 'query-cost',
  queryCostThottleInSec = 'query-cost-thottle-in-sec',
  queryCostThottleInMS = 'query-cost-thottle-in-ms',

  resMsg = 'res.msg',
  errMsg = 'err.msg',
  errStack = 'err.stack',

  svcMemoryUsage = 'svc.memory-usage',

  procCpuinfo = 'proc.cpuinfo',
  ProcDiskstats = 'proc.diskstats',
  procMeminfo = 'proc.meminfo',
  procStat = 'proc.stat'
}

export interface SpanHeaderInit {
  [HeadersKey.traceId]: string
}
export interface SpanLogInput {
  [key: string]: unknown
}

export interface LogInfo {
  /**
   * debug | info | warn | error
   */
  level: keyof ILogger
  msg: unknown
  args?: unknown[]
  [key: string]: unknown
}

export interface TracerError extends Error {
  __isTraced: boolean
}

