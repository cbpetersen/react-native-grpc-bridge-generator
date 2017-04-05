/* eslint-env jest */

import iosHeader from '../src/objective-c-header-creator'

it('creates header output', () => {
  const rsp = iosHeader('FunService')

  expect(rsp).toMatchSnapshot()
})
