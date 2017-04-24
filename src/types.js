// @flow

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
  imports: Array<any>,
  enums: Array<Enum>,
  messages: Array<Message>,
  services: Array<Service>
}
