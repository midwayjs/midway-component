import { defaultTracerConfig } from '../lib/config'
import { TracerConfig } from '../lib/types'


export const tracer: TracerConfig = {
  ...defaultTracerConfig,
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 0.0001,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}
