const os = require('os');
const tmpDir = os.tmpdir();

export default {
  eggPaths: [],
  logger: {
    dir: tmpDir,
  },
  rundir: tmpDir,
  static: {
    dir: tmpDir,
  }
}
