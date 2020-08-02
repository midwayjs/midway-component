import { Configuration } from '@midwayjs/decorator';
import { join, resolve } from 'path';

@Configuration({
  imports: [
    resolve(join(__dirname, '../../../../src'))
  ],
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {
}
