import { join } from 'path';

export default (appInfo) => {
  return {
    eggPlugins: {
      mysql: {
        enable: true,
        package: 'egg-mysql'
      }
    },
    eggPaths:[
      join(appInfo.baseDir, '../../../../../../../')
    ],
    middleware: ['bbb'],
    keys: 'bbbb'
  }
}
