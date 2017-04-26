// @flow

import { actionCreatorName, actionCreatorRequestName } from '../utils'
import type { Schema } from '../types'

export const generateActionCreator = (name: string, type: string) =>
`
export const ${actionCreatorName(name)} = (payload: ${type}) => ({
  meta: {
    delivery: 'grpc'
  },
  type: '${actionCreatorRequestName(name)}',
  payload
})
`.trim()

export const generateFileHeader = () => `// @flow`.trim()

export default (schema: Schema) => {
  const fileOutput = []
  const output = []
  const types = []
  schema.services.forEach((service) => {
    service.methods.forEach((method) => {
      if (!types.some(type => type === method.input_type)) {
        types.push(method.input_type)
      }

      output.push(generateActionCreator(method.name, method.input_type))
    }, this)
  }, this)

  fileOutput.push(generateFileHeader())
  fileOutput.push(`import type { ${types.join(', ')} } from './flow-types'`)

  return fileOutput.concat(output).join('\n\n')
}
