const primitiveTypes = ['double' , 'float' , 'int32' , 'int64' , 'uint32' ,
    'uint64' , 'sint32' , 'sint64' , 'fixed32' , 'fixed64' , 'sfixed32' ,
    'sfixed64' , 'bool' , 'string' , 'bytes']

const tabLength = 2

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

const indent = (length) => {
  return ''.padStart(length)
}

const generateFieldOutput = (field, schema, fieldPath, indention, index, length) => {
  const append = isLast(index, length) ? '' : ','
  const debug = `// islast field: ${isLast(index, length)}`

  if (primitiveTypes.some(type => type === field.type)) {
      if (field.type === 'string') {
        return `${indent(indention)}@"${field.name}": ${fieldPath}.${field.name} ?: [NSNull null]${append} ${debug}`

      }

      return `${indent(indention)}@"${field.name}": @(${fieldPath}.${field.name})${append} ${debug}`
  }

  // TODO: else find type
  // console.log(field)
  return `${indent(indention)}@"${field.name}": ${generateNonPrimitiveTypeOutput(field, schema, fieldPath, indention, index, length)}`
}

const generateNonPrimitiveTypeOutput = (message, schema, fieldPath, indention, index, length) => {
  const output = []
  var output_type = schema.messages.find(x => x.name === message.type)

  if (message.repeated) {
    output.push(`NSMutableArray *x = [[NSMutableArray alloc] init];`)
    output.push(`${indent(indention)}for (${message.type} *obj in response.${message.name}) {`)

    const repeatedOutputs = []
    repeatedOutputs.push(`${indent(indention + 2)}[x addObject: @{`)
    output_type.fields.forEach((field, innerIndex) => {
      repeatedOutputs.push(`${indent(0)}${generateFieldOutput(field, schema, 'obj', indention + 4, innerIndex, output_type.fields.length)}`)
    }, this)
    repeatedOutputs.push(`${indent(indention + 2)}};`)
    repeatedOutputs.push(`${indent(indention)}}`)

    output.push(`${repeatedOutputs.join('\n')}`)
    output.push(`${indent(indention - 2)}}`)
    output.push(``)
  }
  else {
    output.push(`@{`)
    output_type.fields.forEach((field, innerIndex) => {
      output.push(`${indent(0)}${generateFieldOutput(field, schema, fieldPath, indention +2, innerIndex, output_type.fields.length)}`)
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

const generateMessageOutput = (method, schema, indention) => {
  const output = []
  // console.log(method)
  var output_type = schema.messages.find(x => x.name === method.output_type)
  // console.log(output_type)
  // console.log(`output type: ${output_type}`)
  const fieldPath = 'response'
  if (output_type.fields.some(field => field.repeated)) {
    if (output_type.fields.length === 1) {
      output_type.fields.forEach((field, index) => {
        // output.push(`${indent(4)}${generateFieldOutput(field, schema, fieldPath, indention, index, output_type.fields.length)}`)
        output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)
      }, this)
      output.push(`${indent(indention)}resolve(x);`)
    } else {
      throw new Error('not supported yet')
    }
  } else {
    output.push(`${indent(indention)}resolve(@{ `)
    output_type.fields.forEach((field, index) => {
      output.push(`${generateFieldOutput(field, schema, fieldPath, indention + 2, index, output_type.fields.length)}`)
      // output.push(`${indent(4)}${generateFieldOutput(field, schema, fieldPath, indention, index, output_type.fields.length)}`)
    }, this)
    output.push(`${indent(indention)}});`)
  }

  return `${output.join('\n')}`
}

const generateServiceOutput = (service, schema) => {
  const output = []

  service.methods.forEach((method) => {
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
    output.push(`${method_output}`)

    output.push(`${indent(2)}}`)
    output.push(`}`)
    output.push(``)
  }, this)

  return output.join('\n')
}

export default (schema) => {
  const output = []
  console.dir(schema, {depth: null, color: true})
  schema.services.forEach((service) => {
    console.log(service.name)
    const service_output = generateServiceOutput(service, schema)
    output.push(service_output)
  }, this)

  return output.join('\n\n')
}
