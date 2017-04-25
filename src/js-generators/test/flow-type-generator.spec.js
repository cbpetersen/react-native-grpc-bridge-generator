/* eslint-env jest */

import generator, { generateFlowType, generateField, messageMapper } from '../flow-type-generator'

describe('generateFlowType', () => {
  it('creates an empty flow type definition', () => {
    const rsp = generateFlowType('Empty', '')

    expect(rsp).toMatchSnapshot()
  })

  it('creates an flow type definition', () => {
    const rsp = generateFlowType('Empty', '  name: string')

    expect(rsp).toMatchSnapshot()
  })
})

describe('generateField', () => {
  it('creates a primitive value definition', () => {
    let field = {
      type: 'string',
      name: 'addressString'
    }
    const rsp = generateField(field, 2, 1, 1)

    expect(rsp).toMatchSnapshot()
  })

  it('creates a repeated primitive value definition', () => {
    let field = {
      type: 'string',
      name: 'addressStrings',
      repeated: true
    }
    const rsp = generateField(field, 2, 1, 1)

    expect(rsp).toMatchSnapshot()
  })

  it('creates a type definition', () => {
    let field = {
      type: 'Location',
      name: 'Place'
    }
    const rsp = generateField(field, 2, 1, 1)

    expect(rsp).toMatchSnapshot()
  })

  it('creates a repeated type definition', () => {
    let field = {
      type: 'Location',
      name: 'Places',
      repeated: true
    }
    const rsp = generateField(field, 2, 1, 1)

    expect(rsp).toMatchSnapshot()
  })
})

describe('messageMapper', () => {
  it('creates a flow type definition', () => {
    let message = {
      name: 'Location',
      fields: [{
        type: 'string',
        name: 'addressString'
      }, {
        type: 'float',
        name: 'lat'
      }, {
        type: 'float',
        name: 'lng'
      }]
    }
    const rsp = messageMapper(message)

    expect(rsp).toMatchSnapshot()
  })
})

describe('generator', () => {
  it('creates a hole flow type definition file output', () => {
    let schema = {
      messages: [{
        name: 'Location',
        fields: [{
          type: 'string',
          name: 'addressString'
        }, {
          type: 'float',
          name: 'lat'
        }, {
          type: 'float',
          name: 'lng'
        }]
      }, {
        name: 'Places',
        fields: [{
          type: 'Location',
          name: 'locations',
          repeated: true
        }]
      }]
    }
    const rsp = generator(schema)

    expect(rsp).toMatchSnapshot()
  })
})
