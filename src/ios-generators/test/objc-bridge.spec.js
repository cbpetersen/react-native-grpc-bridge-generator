/* eslint-env jest */

import fs from 'fs'
var schema = require('protocol-buffers-schema')
import ios from '../objc-bridge'

it('creates sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/sample.proto`, 'utf-8')
  const rsp = ios(schema(sample))

  expect(rsp).toMatchSnapshot()
})

it('creates nested sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/nested-output-sample.proto`, 'utf-8')
  const rsp = ios(schema(sample))

  expect(rsp).toMatchSnapshot()
})

it('creates multiple service sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/multiple-services.proto`, 'utf-8')
  const rsp = ios(schema(sample))

  expect(rsp).toMatchSnapshot()
})

it('creates multiple nested messages sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/multiple-nested-sample.proto`, 'utf-8')
  const rsp = ios(schema(sample))

  expect(rsp).toMatchSnapshot()
})
