// @flow

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

String.prototype.lowerFirstChar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
if (!String.prototype.toLowerCaseFirstChar) {
  String.prototype.toLowerCaseFirstChar = function() {
      return this.substr( 0, 1 ).toLowerCase() + this.substr( 1 );
  }
}

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart (targetLength, padString) {
    targetLength = targetLength >> 0  // floor if number or convert non-number to 0;
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length)  // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

const indent = (length: number) => {
  return ''.padStart(length)
}

const append = (index: number, length: number) => {
  return isLast(index, length) ? '' : ','
}

const isLast = (index, length) => {
  return index >= length - 1
}

const generateFieldOutput = (field: Field, schema: Schema, fieldPath: string, indention, index, length) => {
  const debug = ``//// islast field: ${isLast(index, length)}`

  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}@"${field.name}": ${fieldPath}.${field.name} ?: [NSNull null]${append(index, length)} ${debug}`
    }

    return `${indent(indention)}@"${field.name}": @(${fieldPath}.${field.name})${append(index, length)} ${debug}`
  }

  if (field.repeated) {
    return `${indent(indention)}@"${field.name}": map${field.type}s(${fieldPath}.${field.name}Array)${append(index, length)} ${debug}`
  }

  return `${indent(indention)}@"${field.name}": map${field.type}(${fieldPath}.${field.name})${append(index, length)} ${debug}`
}

/*
to generate

NSMutableArray* mapDrivers(Driver* obj)
{
}
*/
const generateArrayMappers = (field: Field, schema: Schema) => {
  const output = []
  const indention = 2

  output.push(`${indent(0)}NSMutableArray* map${field.type}s(NSMutableArray* input) {`)
  output.push(`${indent(indention)}NSMutableArray *output = [[NSMutableArray alloc] init];`)
  output.push(`${indent(indention)}for (${field.type} *obj in input) {`)
  output.push(`${indent(indention + 2)}[output addObject: map${field.type}(obj)];`)
  output.push(`${indent(indention)}}`)
  output.push(``)
  output.push(`${indent(indention)}return output;`)
  output.push(`${indent(0)}}`)

  return output.join('\n')
}

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

  output.push(`${indent(0)}NSDictionary* map${message.name}(${message.name}* obj) {`)
  output.push(`${indent(indention)}return @{ `)
  message.fields.forEach((field, innerIndex) => {
    if (field.repeated && !arrayMappers[`${field.type}`]) {
      arrayOutput.push(generateArrayMappers(field, schema))
      arrayOutput.push(``)
      arrayMappers[`${field.type}`] = true
    }

    output.push(`${indent(0)}${generateFieldOutput(field, schema, 'obj', indention + 2, innerIndex, message.fields.length)}`)
  }, this)

  output.push(`${indent(indention)}};`)
  output.push(`}`)
  output.push(``)

  return arrayOutput.concat(output).join('\n')
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
    output.push(`RCT_EXPORT_METHOD(${method.name.toLowerCaseFirstChar()}:(${method.input_type} *)req`)
    output.push(`${indent(2)}resolver:(RCTPromiseResolveBlock) resolve`)
    output.push(`${indent(2)}rejecter:(RCTPromiseRejectBlock) reject) {`)
    output.push(`${indent(2)}[_service ${method.name.toLowerCaseFirstChar()}WithRequest:req handler:^(${method.output_type} *response, NSError *error) {`)
    output.push(`${indent(4)}if (error) {`)
    output.push(`${indent(6)}reject([@(error.code) stringValue], error.description, error);`)
    output.push(`${indent(6)}return;`)
    output.push(`${indent(4)}}`)
    output.push(``)
    output.push(`${indent(4)}NSLog(@"native ${method.name}: %@", response);`)
    output.push(``)
    output.push(`${methodOutput}`)
    output.push(`${indent(2)}}];`)
    output.push(`}`)
    output.push(``)
  }, this)

  return output.join('\n')
}

export default (schema: Schema) => {
  const output = []
  console.dir(schema, {depth: null, color: true})

  schema.messages.forEach((message) => {
    output.push(generateMessageMappers(message, schema))
  }, this)

  schema.services.forEach((service) => {
    console.log(service.name)
    const serviceOutput = generateServiceOutput(service, schema)
    output.push(serviceOutput)
  }, this)

  return output.join('\n\n')
}
