// @flow

export const primitiveTypes = ['double', 'float', 'int32', 'int64', 'uint32',
  'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32',
  'sfixed64', 'bool', 'string', 'bytes']

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

export type EnumValue = {
  value: number,
  options: Object
}

export type Enum = {
  name: string,
  values: Array<EnumValue>,
  options: Object
}

export type Field = {
  name: string,
  type: string,
  tag: number,
  map: string,
  oneof: string,
  required: boolean,
  repeated: boolean,
  options: {}
}

export type Message = {
  name: string,
  enums: [],
  extends: [],
  messages: Array<Message>,
  fields: Array<Field>,
  extensions: Message
}

export type Method = {
  name: string,
  input_type: string,
  output_type: string,
  client_streaming: boolean,
  server_streaming: boolean,
  options: Object
}

export type Service = {
  name: string,
  methods: Array<Method>,
  options: Object
}

export type Schema = {
  syntax: number,
  package: string,
  imports: Array,
  enums: Array<Enum>,
  messages: Array<Message>,
  services: Array<Service>
}
