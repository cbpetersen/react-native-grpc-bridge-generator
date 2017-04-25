// @flow

import camelCase from 'lodash.camelcase'

import { moduleName, mapReservedKeyword, indent, append, primitiveTypes } from '../utils'
import type { Field, Schema, Message, Method, Service } from '../types'

const arrayMappers = {}

const generateFieldOutput = (field: Field, schema: Schema, fieldPath: string, indention, index, length) => {
  const fieldName = mapReservedKeyword(field.name)
  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}@"${field.name}": ${fieldPath}.${fieldName} ?: [NSNull null]${append(index, length)}`
    }

    return `${indent(indention)}@"${field.name}": @(${fieldPath}.${fieldName})${append(index, length)}`
  }

  if (field.repeated) {
    return `${indent(indention)}@"${field.name}": map${field.type}s(${fieldPath}.${fieldName}Array)${append(index, length)}`
  }

  return `${indent(indention)}@"${field.name}": map${field.type}(${fieldPath}.${fieldName})${append(index, length)}`
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
  const fieldName = mapReservedKeyword(field.name)

  if (primitiveTypes.some(type => type === field.type)) {
    if (field.type === 'string') {
      return `${indent(indention)}output.${fieldName} = [RCTConvert NSString:input[@"${field.name}"]];`
    } else if (field.type === 'double') {
      return `${indent(indention)}output.${fieldName} = [[RCTConvert NSNumber:input[@"${field.name}"]] doubleValue];`
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
    const inputMessageType: ?Message = schema.messages.find(msg => msg.name === method.input_type)

    if (!inputMessageType) {
      throw new Error(`${method.input_type} Message type not found in the schema`)
    }

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

const generateFileConstructor = (name: string) => `
#import "${moduleName(name)}.h"
#import <GRPCClient/GRPCCall+Tests.h>
#import "${name}.pbrpc.h"
#import <react/RCTConvert.h>

@implementation ${moduleName(name)}

${name} *_service;

- (instancetype)initWithHost:(NSString *)host {
  if (self = [super init]) {
    [GRPCCall useInsecureConnectionsForHost:host];

    _service = [[${name} alloc] initWithHost:host];
  }

  return self;
}

RCT_EXPORT_MODULE(${moduleName(name)});
\n`.trim()

export default (schema: Schema) => {
  const output = []

  output.push(generateFileConstructor(schema.services[0].name))

  schema.messages.forEach((message) => {
    output.push(generateMessageMappers(message, schema))
  }, this)

  schema.services.forEach((service) => {
    service.methods.forEach((method) => {
      const inputMessageType: ?Message = schema.messages.find(msg => msg.name === method.input_type)
      if (!inputMessageType) {
        throw new Error(`${method.input_type} Message type not found in the schema`)
      }

      const requestMappingOutput = generateRequestMapping(inputMessageType, schema, 4)
      output.push(requestMappingOutput)
    }, this)

    const serviceOutput = generateServiceOutput(service, schema)
    output.push(serviceOutput)
  }, this)

  output.push(`@end`)

  return output.join('\n\n')
}
