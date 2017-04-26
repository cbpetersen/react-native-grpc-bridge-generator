// @flow

import { actionCreatorName } from '../utils'
import type { Schema } from '../types'

export const generateActionCreator = (name: string, inputType: string, responseType: string) =>
`
export const ${actionCreatorName(name)} = (payload: ${inputType}): ${responseType}|ApiError => NativeModules.GrpcServiceBridgeModule.${actionCreatorName(name)}(payload)
`.trim()

export const generateFileHeader = () => `// @flow

import { NativeModules } from 'react-native'
`.trim()

export default (schema: Schema) => {
  const fileOutput = []
  const output = []
  const types = ['ApiError']
  schema.services.forEach((service) => {
    service.methods.forEach((method) => {
      if (!types.some(type => type === method.input_type)) {
        types.push(method.input_type)
      }

      if (!types.some(type => type === method.output_type)) {
        types.push(method.output_type)
      }

      output.push(generateActionCreator(method.name, method.input_type, method.output_type))
    }, this)
  }, this)

  fileOutput.push(generateFileHeader())
  fileOutput.push(`import type { ${types.join(', ')} } from './SpiriGrpcServiceBridgeModule-flow-types'`)

  return fileOutput.concat(output).join('\n\n')
}
