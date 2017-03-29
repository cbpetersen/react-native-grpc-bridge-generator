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

const generateFieldOutput = (field, schema) => {
  if (primitiveTypes.some(type => type === field.type)) {
      if (field.type === 'string') {
        return `@"${field.name}": @response.${field.name} ?: [NSNull null],`

      }

      return `@"${field.name}": @(response.${field.name}),`
  }

  // TODO: else find type
  console.log(field)
  return `@"${field.name}": ${generateNonPrimitiveTypeOutput(field, schema)}`
}

const generateNonPrimitiveTypeOutput = (message, schema) => {
  const output = []
  var output_type = schema.messages.find(x => x.name === message.type)

  if (message.repeated) {
    output.push(`NSMutableArray *x = [[NSMutableArray alloc] init];`)
    output.push(`for (${message.type} *l in response.${message.name}) {`)

    const repeatedOutputs = []
    repeatedOutputs.push(`${indent(4)}[x addObject: @{`)
    output_type.fields.forEach((field) => {
      repeatedOutputs.push(`${indent(4)}${generateFieldOutput(field, schema)}`)
    }, this)
    repeatedOutputs.push('}')
    output.push(`${repeatedOutputs.join('\n')}`)
    output.push(`}`)
  }
  else {
    output_type.fields.forEach((field) => {
      output.push(`${indent(4)}${generateFieldOutput(field, schema)}`)
    }, this)

  }

  return output.join('\n')
}

const generateMethodOutput = (method, schema) => {
  const output = []
  // console.log(method)
  var output_type = schema.messages.find(x => x.name === method.output_type)
  // console.log(output_type)
  // console.log(`output type: ${output_type}`)
  if (output_type.fields.some(field => field.repeated)) {
    if (output_type.fields.length === 1) {
      output_type.fields.forEach((field) => {
        output.push(`${indent(4)}${generateFieldOutput(field, schema)}`)
      }, this)
      output.push(`${indent(2)}resolve(x);`)
    } else {
      throw new Error('not supported yet')
    }
  } else {
    output.push(`${indent(2)}resolve(@{ `)
    output_type.fields.forEach((field) => {
      output.push(`${indent(4)}${generateFieldOutput(field, schema)}`)
    }, this)
    output.push(`${indent(2)}});`)
  }



  return output.join('\n')
}

const generateMethods = (service, schema) => {
  const output = []

  service.methods.forEach((method) => {

    const method_output = generateMethodOutput(method, schema)
    output.push(`RCT_EXPORT_METHOD(${method.input_type}:(${method.input_type} *)req`)
    output.push(`${indent(2)}resolver:(RCTPromiseResolveBlock) resolve`)
    output.push(`${indent(2)}rejecter:(RCTPromiseRejectBlock) reject) {`)
    output.push(`${indent(2)}[_service ${method.input_type}:req handler:^(${method.output_type} *response, NSError *error) {`)
    output.push(`${indent(4)}if (error) {`)
    output.push(`${indent(6)}reject([@(error.code) stringValue], error.description, error);`)
    output.push(`${indent(4)}return;`)
    output.push(`${indent(2)}}`)
    output.push(`${indent(2)}NSLog(@"native ${method.name}: %@", response);`)

    output.push(method_output)

    output.push(`}`)
  }, this)

  return output.join('\n')
}

export default (schema) => {
  const output = []
  console.dir(schema, {depth: null, color: true})
  schema.services.forEach((service) => {
    console.log(service.name)
    const service_output = generateMethods(service, schema)
    output.push(service_output)
  }, this)

  return output.join('\n\n')
}
