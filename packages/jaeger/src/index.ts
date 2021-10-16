import { TracerManager } from './lib/tracer'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'
export { TracerMiddleware } from './middleware/tracer.middleware'
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware'


declare module '@midwayjs/core' {
  interface Context {
    tracerManager: TracerManager
  }
}

