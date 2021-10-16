import assert from 'assert'

import { createApp, close } from '@midwayjs/mock'
import {
  Framework,
  IMidwayWebApplication,
  IMidwayWebContext,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { basename } from '@waiting/shared-core'

import { HeadersKey } from '~/lib/types'
import { TracerMiddleware } from '~/middleware/tracer.middleware'


const filename = basename(__filename)

describe(filename, () => {
  let app: IMidwayWebApplication

  beforeAll(async () => {
    app = await createApp<Framework>()
  })
  afterAll(async () => {
    await close(app)
  })

  it('Should work', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    // @ts-expect-error
    await mw(ctx, next)
    const span = ctx.tracerManager.currentSpan()
    expect(span).toBeTruthy()
  })

  it('Should work with parent span', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const parentSpanId = '123'
    ctx.request.headers[HeadersKey.traceId] = `${parentSpanId}:${parentSpanId}:0:1`
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    // @ts-expect-error
    await mw(ctx, next)
    const spanHeaderInit = ctx.tracerManager.headerOfCurrentSpan()
    assert(spanHeaderInit)
    const header = spanHeaderInit[HeadersKey.traceId]
    const expectParentSpanId = header.slice(0, header.indexOf(':'))
    expect(expectParentSpanId).toEqual(parentSpanId)
  })

  it('Should work if path not match whitelist string', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untracedPath'
    // @ts-expect-error
    await mw(ctx, next)
    expect(ctx.tracerManager.isTraceEnabled).toEqual(false)
  })

  it('Should work if path match whitelist regexp', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    ctx.path = '/unitTest' + Math.random().toString()
    // @ts-expect-error
    await mw(ctx, next)
    expect(ctx.tracerManager.isTraceEnabled).toEqual(false)
  })

  it('Should work if path not match whitelist regexp', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    ctx.path = '/unittest' + Math.random().toString()
    // @ts-expect-error
    await mw(ctx, next)
    expect(ctx.tracerManager.isTraceEnabled).toEqual(true)
  })
})


async function next(): Promise<void> {
  return void 0
}

