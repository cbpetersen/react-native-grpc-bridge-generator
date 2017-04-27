/* eslint-env jest */

import generator from '../root-index'

describe('generator', () => {
  it('creates index', () => {
    const rsp = generator(['locations', 'booking', 'pricing'])

    expect(rsp).toMatchSnapshot()
    expect(rsp).not.toContain('undefined')
  })
})
