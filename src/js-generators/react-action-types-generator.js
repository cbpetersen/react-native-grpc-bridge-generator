// @flow

import { actionCreatorRequestName, actionCreatorSuccessName, actionCreatorFailedName } from '../utils'
import type { Schema } from '../types'

export const generateActionCreator = (name: string, type: string) =>
`
export const ${actionCreatorRequestName(name)} = '${actionCreatorRequestName(name)}'
export const ${actionCreatorSuccessName(name)} = '${actionCreatorSuccessName(name)}'
export const ${actionCreatorFailedName(name)} = '${actionCreatorFailedName(name)}'
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

  return fileOutput.concat(output).join('\n\n')
}
