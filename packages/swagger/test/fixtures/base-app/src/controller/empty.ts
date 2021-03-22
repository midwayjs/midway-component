import { Provide, Controller } from '@midwayjs/decorator';

@Provide()
@Controller('/empty')
export class EmptyController {
  // dont delete me, for empty router info test purpose
  // dont add any route in this controller
}
