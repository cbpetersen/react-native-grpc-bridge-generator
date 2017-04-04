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

const primitiveTypes = ['double' , 'float' , 'int32' , 'int64' , 'uint32' ,
    'uint64' , 'sint32' , 'sint64' , 'fixed32' , 'fixed64' , 'sfixed32' ,
    'sfixed64' , 'bool' , 'string' , 'bytes']

const tabLength = 2
let arrays = {};
let method_array_init_output = []
const mappingMethods = {}

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

const generateFieldOutput = (field: Field, schema: Schema, fieldPath: string, indention, index, length) => {
  const debug = `// islast field: ${isLast(index, length)}`

  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}@"${field.name}": ${fieldPath}.${field.name} ?: [NSNull null]${append(index, length)} ${debug}`
    }

    return `${indent(indention)}@"${field.name}": @(${fieldPath}.${field.name})${append(index, length)} ${debug}`
  }

  return `${indent(indention)}@"${field.name}": ${generateNonPrimitiveTypeOutput(field, schema, fieldPath, indention, index, length)}`
}

const generateNonPrimitiveTypeOutput = (message, schema, fieldPath, indention, index, length) => {
  const output = []
  var output_type = schema.messages.find(x => x.name === message.type)

  if (message.repeated) {
    method_array_init_output.push(`${indent(indention)}NSMutableArray *x = [[NSMutableArray alloc] init];`)
    method_array_init_output.push(`${indent(indention)}for (${message.type} *obj in response.${message.name}) {`)

    const repeatedOutputs = []
    repeatedOutputs.push(`${indent(indention + 2)}[x addObject: @{`)
    output_type.fields.forEach((field, innerIndex) => {
      repeatedOutputs.push(`${indent(0)}${generateFieldOutput(field, schema, 'obj', indention + 4, innerIndex, output_type.fields.length)}`)
    }, this)
    repeatedOutputs.push(`${indent(indention + 2)}};`)
    repeatedOutputs.push(`${indent(indention)}}`)

    method_array_init_output.push(`${repeatedOutputs.join('\n')}`)
    method_array_init_output.push(`${indent(indention - 2)}}`)
    method_array_init_output.push(``)
  } else {
    output.push(`@{`)
    console.log(message)
    output_type.fields.forEach((field, innerIndex) => {
      output.push(`${indent(0)}${generateFieldOutput(field, schema, fieldPath, indention + 2, innerIndex, output_type.fields.length)}`)
    }, this)
    if (isLast(index, length)) {
      output.push(`${indent(indention)}}`)
    } else {
      output.push(`${indent(indention)}},`)
    }
  }

  return output.join('\n')
}

const isLast = (index, length) => {
  return index >= length - 1
}

const generateArrayVariable = (field: Field, schema: Schema, fieldPath: string, indention, index, length, varName) => {
 const output = []
  var output_type = schema.messages.find(x => x.name === field.type)

  if (field.repeated) {
    method_array_init_output.push(`${indent(indention)}NSMutableArray *${varName} = [[NSMutableArray alloc] init];`)
    method_array_init_output.push(`${indent(indention)}for (${field.type} *obj in response.${field.name}) {`)

    const repeatedOutputs = []
    repeatedOutputs.push(`${indent(indention + 2)}[${varName} addObject: @{`)
    output_type.fields.forEach((field, innerIndex) => {
      repeatedOutputs.push(`${indent(0)}${generateFieldOutput(field, schema, 'obj', indention + 4, innerIndex, output_type.fields.length)}`)
    }, this)
    repeatedOutputs.push(`${indent(indention + 2)}};`)
    repeatedOutputs.push(`${indent(indention)}}`)

    method_array_init_output.push(`${repeatedOutputs.join('\n')}`)
    method_array_init_output.push(`${indent(indention - 2)}}`)
    method_array_init_output.push(``)
  }
}

const generateArrayMessageOutput = (method: Method, schema: Schema, indention: number) => {
  const output = []
  // console.log(method)
  var output_type = schema.messages.find(x => x.name === method.output_type)
  // console.log(output_type)
  // console.log(`output type: ${output_type}`)
  const fieldPath = 'response'
  // console.log(`repeated`)
  if (output_type.fields.some(field => field.repeated)) {
    // if (output_type.fields.length === 1) {
      // console.log(`repeated`)
      output_type.fields.forEach((field, index) => {
        if (field.repeated) {
          console.log(`repeated ${field.name} path: ${fieldPath}.${field.name}`)
          let varName = `x${Object.getOwnPropertyNames.length}`
          arrays[`${fieldPath}.${field.name}`] = varName
          console.log(arrays)
          generateArrayVariable(field, schema, fieldPath, indention + 2, index, output_type.fields.length, varName)
          // output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)

        }
      }, this)

      // arrays.push(`${fieldPath.field}`)
    // } else {
      // hasArrays = true
      // throw new Error('not supported yet')
  }

  return `${output.join('\n')}`
}

const generateMessageWithoutArrays = (method: Method, schema: Schema, indention) => {
  const output = []
  var output_type = schema.messages.find(x => x.name === method.output_type)
  const fieldPath = 'response'

  if (!output_type.fields.some(field => field.repeated)) {
    output.push(`${indent(indention)}resolve(@{ `)
    output_type.fields.forEach((field, index) => {
      output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)
    }, this)
    output.push(`${indent(indention)}});`)
  }
}

const generateMessageOutput = (method, schema, indention) => {
  const output = []
  // console.log(method)
  var output_type = schema.messages.find(x => x.name === method.output_type)
  // console.log(output_type)
  // console.log(`output type: ${output_type}`)
  const fieldPath = 'response'
  // if (output_type.fields.some(field => field.repeated)) {
  // if (output_type.fields.some(field => field.repeated)) {
    // output.push(`${indention}`)
    // if (output_type.fields.length === 1) {
      // output_type.fields.forEach((field, index) => {
      //   output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)
      // }, this)
      // output.push(`${indent(indention)}resolve(x);`)
    // } else {
      // hasArrays = true

      // throw new Error('not supported yet')
    // }
  // } else {
    // output.push(`${indent(indention)}resolve(@{ `)
    output_type.fields.forEach((field, index) => {
      if (field.repeated) {
        let arrName = arrays[`${fieldPath}.${field.name}`]
        output.push(`${indent(indention + 2)}@"${field.name}": ${arrName}${append(index, output_type.fields.length)}`)
      } else {
        output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)
      }
    }, this)
    // output.push(`${indent(indention)}});`)
  // }

  return `${output.join('\n')}`
}

const generateServiceOutput = (service: Service, schema: Schema) => {
  const output = []

  service.methods.forEach((method) => {
    generateArrayMessageOutput(method, schema, 4)
    const method_output = generateMessageOutput(method, schema, 4)
    output.push(`RCT_EXPORT_METHOD(${method.input_type}:(${method.input_type} *)req`)
    output.push(`${indent(2)}resolver:(RCTPromiseResolveBlock) resolve`)
    output.push(`${indent(2)}rejecter:(RCTPromiseRejectBlock) reject) {`)
    output.push(`${indent(2)}[_service ${method.input_type}:req handler:^(${method.output_type} *response, NSError *error) {`)
    output.push(`${indent(4)}if (error) {`)
    output.push(`${indent(6)}reject([@(error.code) stringValue], error.description, error);`)
    output.push(`${indent(6)}return;`)
    output.push(`${indent(4)}}`)
    output.push(``)
    output.push(`${indent(4)}NSLog(@"native ${method.name}: %@", response);`)
    output.push(``)

    if (Object.getOwnPropertyNames !== 0) {
      output.push(`${method_array_init_output.join('\n')}`)
      output.push(``)
      output.push(`${indent(4)}resolve(@{ `)
    } else {
      output.push(`${indent(4)}resolve(@{ `)
    }

    output.push(`${method_output}`)

    if (Object.getOwnPropertyNames !== 0) {
      output.push(`${indent(4)}resolve(x);`)
      output.push(``)
    } else {
      output.push(`${indent(indention)}});`)
    }

    output.push(`${indent(2)}}`)
    output.push(`}`)
    output.push(``)
  }, this)

  return output.join('\n')
}

export default (schema: Schema) => {
  const output = []
  console.dir(schema, {depth: null, color: true})
  schema.services.forEach((service) => {
    console.log(service.name)
    const service_output = generateServiceOutput(service, schema)
    output.push(service_output)
  }, this)

  return output.join('\n\n')
}
