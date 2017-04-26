/* eslint-env jest */

import generator, { generateFileHeader, generateActionCreator } from '../api-client'

describe('generateActionCreator', () => {
  it('a api function', () => {
    const rsp = generateActionCreator('ReverseGeocode', 'ReverseGeocodeRequest', 'Location')

    expect(rsp).toMatchSnapshot()
    expect(rsp).not.toContain('undefined')
  })
})

describe('generateFileHeader', () => {
  it('creates a file definition', () => {
    const rsp = generateFileHeader()

    expect(rsp).toMatchSnapshot()
    expect(rsp).not.toContain('undefined')
  })
})

describe('generator', () => {
  it('creates a hole flow type definition file output', () => {
    let schema = {
      services: [{
        name: 'GrpcService',
        methods: [{
          name: 'ReverseGeocode',
          input_type: 'ReverseGeocodeRequest',
          output_type: 'Location',
          client_streaming: false,
          server_streaming: false,
          options: {}
        }]
      }]
    }
    const rsp = generator(schema)

    expect(rsp).toMatchSnapshot()
    expect(rsp).not.toContain('undefined')
  })
})
