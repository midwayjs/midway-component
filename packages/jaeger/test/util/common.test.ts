import { basename, join } from '@waiting/shared-core'

import { retrieveExternalNetWorkInfo } from '~/util/common'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {

  it('should retrieveExternalNetWorkInfoworks', async () => {
    const infos = retrieveExternalNetWorkInfo()
    assert(Array.isArray(infos) && infos.length >= 1)
  })

})

