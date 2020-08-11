import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  imports: [
    join(__dirname, '../../../../src')
  ],
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {
}
