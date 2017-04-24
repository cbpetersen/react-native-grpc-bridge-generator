// @flow

import { indent, append, primitiveTypes, ProtoToJsTypeMapping } from './utils'
import type { Field, Schema, Message } from './types'

export const generateFlowType = (name: string, fields: string) =>
`
export type ${name} = {
${fields}
}
`.trim()

export const generateField = (field: Field, indention: number, index: number, length: number) => {
  if (primitiveTypes.some(type => type === field.type)) {
    if (field.repeated) {
      return `${indent(indention)}${field.name}: Array<${ProtoToJsTypeMapping[field.type]}>${append(index, length)}`
    }

    return `${indent(indention)}${field.name}: ${ProtoToJsTypeMapping[field.type]}${append(index, length)}`
  }

  if (field.repeated) {
    return `${indent(indention)}${field.name}: Array<${field.type}>${append(index, length)}`
  }

  return `${indent(indention)}${field.name}: ${field.type}${append(index, length)}`
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
