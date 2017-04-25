/* eslint-env jest */

import generator, { template } from '../index-generator'

describe('template', () => {
  it('creates template', () => {
    const rsp = template('ServiceName123')

    expect(rsp).toMatchSnapshot()
  })
})

describe('generator', () => {
  it('creates the out put with the correct service name', () => {
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
  })
})
