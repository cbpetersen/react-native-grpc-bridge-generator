// @flow

import { indent, append, primitiveTypes, ProtoToJsTypeMapping } from './utils'
import type { Field, Schema, Message } from './types'

export const generateFlowType = (name: string, fields: string) =>
`
export type ${name} = {
${fields}
}
`.trim()

export const repeatedTemplate = (type: string) => `Array<${type}>`

export const generateField = (field: Field, indention: number, index: number, length: number) => {
  let type = ProtoToJsTypeMapping[field.type] || field.type

  if (field.repeated) {
    type = repeatedTemplate(type)
  }

  return `${indent(indention)}${field.name}: ${type}${append(index, length)}`
}

export const messageMapper = (message: Message) => {
  const output = []
  const indention = 2

  message.fields.forEach((field, innerIndex) => {
    output.push(generateField(field, indention, innerIndex, message.fields.length))
  }, this)

  return generateFlowType(message.name, output.join('\n'))
}

export const generateFileHeader = () => `// @flow`.trim()

export default (schema: Schema) => {
  const output = []

  output.push(generateFileHeader())
  schema.messages.forEach((message) => {
    output.push(messageMapper(message))
  }, this)

  return output.join('\n\n')
}
