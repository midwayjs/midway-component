const os = require('os');

const tmpDir = os.tmpdir();

export default {
  eggPlugins: {
    static: false,
    security: false,
    watcher: false,
    multipart: false,
  },
  eggPaths: [],
  logger: {
    dir: tmpDir,
  },
  rundir: tmpDir,
  static: {
    dir: tmpDir,
  }
}
