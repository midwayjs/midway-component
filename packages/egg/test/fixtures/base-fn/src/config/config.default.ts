import { join } from 'path';

export default (appInfo) => {
  return {
    eggPaths:[
      join(appInfo.baseDir, '../../../../../../../')
    ],
    middleware: ['bbb'],
    keys: 'bbbb'
  }
}
