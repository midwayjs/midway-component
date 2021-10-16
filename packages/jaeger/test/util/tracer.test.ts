import assert from 'assert'

import { createApp, close } from '@midwayjs/mock'
import {
  Framework,
  IMidwayWebApplication,
  IMidwayWebContext,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { basename } from '@waiting/shared-core'


import { TracerManager } from '~/lib/tracer'
import { HeadersKey } from '~/lib/types'


const filename = basename(__filename)

describe(filename, () => {
  let app: IMidwayWebApplication

  beforeAll(async () => {
    app = await createApp<Framework>()
  })
  afterAll(async () => {
    await close(app)
  })
  it('should work if enabled', async () => {
    const tracerManager = new TracerManager(true)
    tracerManager.startSpan('mySpan')
    expect(tracerManager.currentSpan()).toBeTruthy()
    tracerManager.finishSpan()
    expect(tracerManager.currentSpan()).toBeUndefined()
  })
  it('new span should be child of preceding span', async () => {
    const tracerManager = new TracerManager(true)
    tracerManager.startSpan('span1')
    const spanHeaderInit1 = tracerManager.headerOfCurrentSpan()
    assert(spanHeaderInit1)
    const header1 = spanHeaderInit1[HeadersKey.traceId]

    tracerManager.startSpan('span2')
    const spanHeaderInit2 = tracerManager.headerOfCurrentSpan()
    assert(spanHeaderInit2)
    const header2 = spanHeaderInit2[HeadersKey.traceId]

    expect(header2.split(':')[2]).toEqual(header1.split(':')[0])
  })
  it('should not work if disabled', async () => {
    const tracerManager = new TracerManager(false)
    tracerManager.startSpan('mySpan')
    expect(tracerManager.currentSpan()).toBeUndefined()
  })
  it('should header be undefined if no span', async () => {
    const tracerManager = new TracerManager(false)
    const headersInit = tracerManager.headerOfCurrentSpan()
    assert(typeof headersInit === 'undefined')
  })
})

