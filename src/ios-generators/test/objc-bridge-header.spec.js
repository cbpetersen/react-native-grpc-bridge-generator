/* eslint-env jest */

import iosHeader from '../objc-bridge-header'

it('creates header output', () => {
  const rsp = iosHeader('FunService')

  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})
