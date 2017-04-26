// @flow
import snakeCase from 'lodash.snakecase'
import camelcase from 'lodash.camelcase'
import pascalcase from 'pascal-case'

import type { Schema } from './types'

export const primitiveTypes = ['double', 'float', 'int32', 'int64', 'uint32',
  'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32',
  'sfixed64', 'bool', 'string', 'bytes']

const classPrefixOption = 'objc_class_prefix'

export const ProtoToJsTypeMapping = {
  double: 'number',
  float: 'number',
  int64: 'number',
  uint64: 'number',
  int32: 'number',
  fixed64: 'number',
  fixed32: 'number',
  bool: 'boolean',
  string: 'string',
  bytes: 'ByteBuffer',
  uint32: 'number',
  sfixed32: 'number',
  sfixed64: 'number',
  sint32: 'number',
  sint64: 'number'
}

export const objcClassPrefix = (schema: Schema) => schema.options[classPrefixOption] || ''

export const moduleName = (serviceName: string) => `${pascalcase(serviceName)}BridgeModule`

export const fileName = (serviceName: string) => moduleName(pascalcase(serviceName))
export const jsFileName = (serviceName: string) => camelcase(serviceName)

export const actionCreatorName = (name: string) => camelcase(name)
export const actionCreatorRequestName = (name: string) => snakeCase(`${name}_grpc_request`).toUpperCase()
export const actionCreatorSuccessName = (name: string) => snakeCase(`${name}_grpc_success`).toUpperCase()
export const actionCreatorFailedName = (name: string) => snakeCase(`${name}_grpc_failed`).toUpperCase()

export const mapReservedKeyword = (fieldName: string) => {
  switch (fieldName) {
    case 'id':
      return 'id_p'

    default:
      return fieldName
  }
}

export const indent = (length: number) => ' '.repeat(length)
export const append = (index: number, length: number) => isLast(index, length) ? '' : ','
export const isLast = (index: number, length: number) => index >= length - 1
