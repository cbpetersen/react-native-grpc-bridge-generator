/* eslint-env jest */

import fs from 'fs'
var schema = require('protocol-buffers-schema')
import ios from '../objc-bridge'

const fileName = 'sample'

it('creates sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/sample.proto`, 'utf-8')
  const rsp = ios(schema(sample), fileName)

  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})

it('creates sample output with classPrefix', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/sample.proto`, 'utf-8')
  const protoSchema = schema(sample)
  protoSchema.options['objc_class_prefix'] = 'DRI'
  const rsp = ios(protoSchema, fileName)
  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})

it('creates nested sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/nested-output-sample.proto`, 'utf-8')
  const rsp = ios(schema(sample), fileName)

  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})

it('creates multiple service sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/multiple-services.proto`, 'utf-8')
  const rsp = ios(schema(sample), fileName)

  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})

it('creates multiple nested messages sample output', () => {
  const sample = fs.readFileSync(`${__dirname}/../../../test-samples/multiple-nested-sample.proto`, 'utf-8')
  const rsp = ios(schema(sample), fileName)

  expect(rsp).toMatchSnapshot()
  expect(rsp).not.toContain('undefined')
})
