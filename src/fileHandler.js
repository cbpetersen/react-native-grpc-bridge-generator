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

export default (protoFile: string) => {
  const file = fs.readFileSync(protoFile, 'utf-8')
  const schema = schemaParser.parse(file)
  const realProtoFileName = path.parse(protoFile).name
  const protoFileName = schema.services[0].name
  const iosBridgeFile = ios(schema, realProtoFileName)
  const iosBridgeHeaderFile = iosHeaderCreator(protoFileName)

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  } else {
    del.sync(['output/**'])
    fs.mkdirSync('output')
    fs.mkdirSync('output/js')
    fs.mkdirSync(`output/js/${jsFileName(protoFileName)}`)
    fs.mkdirSync('output/ios')
  }

  fs.writeFileSync(`output/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.h`, iosBridgeHeaderFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.m`, iosBridgeFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(protoFileName)}/flow-types.js`, flowTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(protoFileName)}/actions.js`, reactActionCreators(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(protoFileName)}/action-types.js`, actionTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(protoFileName)}/api-client.js`, apiClient(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/js/${jsFileName(protoFileName)}/index.js`, indexGen(schema), {encoding: 'utf-8'})

  console.log(iosBridgeFile)
}
