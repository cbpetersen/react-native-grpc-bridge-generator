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
import rootIndex from './js-generators/root-index'

import { fileName, jsFileName, objcClassPrefix } from './utils'

let outputDirectory = 'output'

const processFile = (filePathString: string) => {
  const file = fs.readFileSync(filePathString, 'utf-8')
  const schema = schemaParser.parse(file)
  const realProtoFileName = path.parse(filePathString).name
  const protoFileName = schema.services[0].name
  const iosBridgeFile = ios(schema, realProtoFileName)
  const iosBridgeHeaderFile = iosHeaderCreator(protoFileName)

  fs.mkdirSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}`)

  fs.writeFileSync(`${outputDirectory}/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.h`, iosBridgeHeaderFile, {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/ios/${objcClassPrefix(schema)}${fileName(protoFileName)}.m`, iosBridgeFile, {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}/flow-types.js`, flowTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}/actions.js`, reactActionCreators(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}/action-types.js`, actionTypes(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}/api-client.js`, apiClient(schema), {encoding: 'utf-8'})
  fs.writeFileSync(`${outputDirectory}/js/${jsFileName(realProtoFileName)}/index.js`, indexGen(schema), {encoding: 'utf-8'})
}

const processDirectory = (directoryPathString:string) => {
  const files = fs.readdirSync(directoryPathString).filter(file => file.endsWith('.proto'))
  files.forEach(file => {
    processFile(path.join(directoryPathString, file))
  })

  fs.writeFileSync(`${outputDirectory}/js/index.js`, rootIndex(files.map(file => jsFileName(path.parse(file).name))), {encoding: 'utf-8'})
}

module.exports = (argv) => {
  if (argv.output) {
    outputDirectory = argv.output
  }

  del.sync([`${outputDirectory}/**`])
  fs.mkdirSync(`${outputDirectory}`)
  fs.mkdirSync(`${outputDirectory}/ios`)
  fs.mkdirSync(`${outputDirectory}/js`)

  console.log(argv)
  console.log(argv.input)


  if (fs.lstatSync(argv.input).isDirectory()) {
    return processDirectory(argv.input)
  }

  processFile(argv.input)
  fs.writeFileSync(`output/js/index.js`, rootIndex(jsFileName(path.parse(argv.input).name)), {encoding: 'utf-8'})
}
