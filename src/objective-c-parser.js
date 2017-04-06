// @flow

import camelCase from 'lodash.camelcase'

type EnumValue = {
  value: number,
  options: Object
}

type Enum = {
  name: string,
  values: Array<EnumValue>,
  options: Object
}

type Field = {
  name: string,
  type: string,
  tag: number,
  map: string,
  oneof: string,
  required: boolean,
  repeated: boolean,
  options: {}
}

type Message = {
  name: string,
  enums: [],
  extends: [],
  messages: Array<Message>,
  fields: Array<Field>,
  extensions: Message
}

type Method = {
  name: string,
  input_type: string,
  output_type: string,
  client_streaming: boolean,
  server_streaming: boolean,
  options: Object
}

type Service = {
  name: string,
  methods: Array<Method>,
  options: Object
}

type Schema = {
  syntax: number,
  package: string,
  imports: Array,
  enums: Array<Enum>,
  messages: Array<Message>,
  services: Array<Service>
}

const primitiveTypes = ['double', 'float', 'int32', 'int64', 'uint32',
  'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32',
  'sfixed64', 'bool', 'string', 'bytes']

const arrayMappers = {}

const indent = (length: number) => ' '.repeat(length)
const append = (index: number, length: number) => isLast(index, length) ? '' : ','
const isLast = (index, length) => index >= length - 1

const generateFieldOutput = (field: Field, schema: Schema, fieldPath: string, indention, index, length) => {
  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}@"${field.name}": ${fieldPath}.${field.name} ?: [NSNull null]${append(index, length)}`
    }

    return `${indent(indention)}@"${field.name}": @(${fieldPath}.${field.name})${append(index, length)}`
  }

  if (field.repeated) {
    return `${indent(indention)}@"${field.name}": map${field.type}s(${fieldPath}.${field.name}Array)${append(index, length)}`
  }

  return `${indent(indention)}@"${field.name}": map${field.type}(${fieldPath}.${field.name})${append(index, length)}`
}

/*
to generate

NSMutableArray* mapDrivers(Driver* obj)
{
}
*/
const generateArrayMappers = (field: Field, schema: Schema) =>
`
static inline NSMutableArray* map${field.type}s(NSMutableArray* input) {
  NSMutableArray *output = [[NSMutableArray alloc] init];
  for (${field.type} *obj in input) {
    [output addObject: map${field.type}(obj)];
  }

  return output;
}
`.trim()

/*
to generate

NSDictionary* mapDriver(Driver* obj)
{
}
*/
const generateMessageMappers = (message: Message, schema: Schema) => {
  const output = []
  const arrayOutput = []
  const indention = 2

  message.fields.forEach((field, innerIndex) => {
    if (field.repeated && !arrayMappers[`${field.type}`]) {
      arrayOutput.push(generateArrayMappers(field, schema))
      arrayOutput.push(``)
      arrayMappers[`${field.type}`] = true
    }

    output.push(`${indent(0)}${generateFieldOutput(field, schema, 'obj', indention + 2, innerIndex, message.fields.length)}`)
  }, this)

  return `
${arrayOutput.join('\n')}

static inline NSDictionary* map${message.name}(${message.name}* obj) {
  return @{
${output.join('\n')}
  };
}`.trim()
}

const mapRequestFields = (field: Field, schema: Schema, indention, index, length) => {
  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}output.${field.name} = [RCTConvert NSString:input[@"${field.name}"]];`
    } else if (field.type === 'double') {
      return `${indent(indention)}output.${field.name} = [[RCTConvert NSNumber:input[@"${field.name}"]] doubleValue];`
    }
  }
}

const generateRequestMapping = (message: Message, schema: Schema) => {
  const output = []
  const indention = 2

  message.fields.forEach((field, innerIndex) => {
    output.push(mapRequestFields(field, schema, indention + 2, innerIndex, message.fields.length))
  }, this)

  return `
static inline ${message.name}* mapToGRPC${message.name}(NSDictionary* input) {
  ${message.name} *output = [[${message.name} alloc] init];
${output.join('\n')}
  return output;
}`.trim()
}

const generateMethodOutput = (method: Method, schema: Schema, indention) => {
  const output = []
  output.push(`${indent(indention)}resolve(map${method.output_type}(response));`)

  return `${output.join('\n')}`
}

const generateServiceOutput = (service: Service, schema: Schema) => {
  const output = []

  service.methods.forEach((method) => {
    const methodOutput = generateMethodOutput(method, schema, 4)
    const inputMessageType = schema.messages.find(msg => msg.name === method.input_type)

    output.push(`
RCT_EXPORT_METHOD(${camelCase(method.name)}:(NSDictionary *)input
  resolver:(RCTPromiseResolveBlock) resolve
  rejecter:(RCTPromiseRejectBlock) reject) {
  [_service ${camelCase(method.name)}WithRequest:mapToGRPC${inputMessageType.name}(input) handler:^(${method.output_type} *response, NSError *error) {
    if (error) {
      reject([@(error.code) stringValue], error.description, error);
      return;
    }

    NSLog(@"native ${method.name}: %@", response);

${methodOutput}
  }];
}
`.trim())
    output.push(``)
  }, this)

  return output.join('\n')
}

export default (schema: Schema) => {
  const output = []

  schema.messages.forEach((message) => {
    output.push(generateMessageMappers(message, schema))
  }, this)

  schema.services.forEach((service) => {
    service.methods.forEach((method) => {
      const inputMessageType = schema.messages.find(msg => msg.name === method.input_type)
      const requestMappingOutput = generateRequestMapping(inputMessageType, schema, 4)
      output.push(requestMappingOutput)
    }, this)

    const serviceOutput = generateServiceOutput(service, schema)
    output.push(serviceOutput)
  }, this)

  return output.join('\n\n')
}
