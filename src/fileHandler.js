// @flow

import fs from 'fs'
import path from 'path'
import del from 'del'
import schemaParser from 'protocol-buffers-schema'

import iosHeaderCreator from './ios-generators/objc-bridge-header'
import ios from './ios-generators/objc-bridge'

import flowTypes from './js-generators/flow-types'
import reactActionCreators from './js-generators/action-creators'
import actionTypes from './js-generators/action-types'
import apiClient from './js-generators/api-client'
import indexGen from './js-generators/index-generator'

import { fileName, jsFileName, objcClassPrefix } from './utils'

const processFile = (filePathString: string) => {
  const file = fs.readFileSync(filePathString, 'utf-8')
  const schema = schemaParser.parse(file)
  const realProtoFileName = path.parse(filePathString).name
  const protoFileName = schema.services[0].name
  const iosBridgeFile = ios(schema, realProtoFileName)
  const iosBridgeHeaderFile = iosHeaderCreator(protoFileName)

  fs.mkdirSync(`output/js/${jsFileName(realProtoFileName)}`)

  fs.writeFileSync(`output/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.h`, iosBridgeHeaderFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.m`, iosBridgeFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(realProtoFileName)}/flow-types.js`, flowTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(realProtoFileName)}/actions.js`, reactActionCreators(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(realProtoFileName)}/action-types.js`, actionTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(realProtoFileName)}/api-client.js`, apiClient(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(realProtoFileName)}/index.js`, indexGen(schema), {encoding: 'utf-8'})
}

const processDirectory = (directoryPathString:string) => {
  const files = fs.readdirSync(directoryPathString)
  files.forEach(file => {
    processFile(path.join(directoryPathString, file))
  })
}

export default (pathString: string) => {
  del.sync(['output/**'])
  fs.mkdirSync('output')
  fs.mkdirSync('output/ios')
  fs.mkdirSync('output/js')

  if (fs.lstatSync(pathString).isDirectory()) {
    return processDirectory(pathString)
  }

  return processFile(pathString)
}
