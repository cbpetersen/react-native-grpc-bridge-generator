// @flow

import fs from 'fs'
import iosHeaderCreator from './objective-c-header-creator'
import schema from 'protocol-buffers-schema'
import ios from './objective-c-parser'
import flowTypes from './flow-type-generator'
import reactActionCreators from './react-action-creator-generator'
import { fileName } from './utils'

export default (protoFile: string) => {
  const file = fs.readFileSync(protoFile, 'utf-8')
  const fileSchema = schema.parse(file)
  const protoFileName = fileSchema.services[0].name
  const iosBridgeFile = ios(fileSchema)
  const iosBridgeHeaderFile = iosHeaderCreator(protoFileName)

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }

  fs.writeFileSync(`output/${fileName(protoFileName)}.h`, iosBridgeHeaderFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/${fileName(protoFileName)}.m`, iosBridgeFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/${fileName(protoFileName)}-flow-types.js`, flowTypes(fileSchema), {encoding: 'utf-8'})
  fs.writeFileSync(`output/${fileName(protoFileName)}-actions.js`, reactActionCreators(fileSchema), {encoding: 'utf-8'})

  // console.log(fileSchema)
  console.log('')
  console.log('')
  // console.log(iosBridgeFile)
  console.log(reactActionCreators(fileSchema))
}
