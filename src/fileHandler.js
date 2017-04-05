// @flow

import fs from 'fs'
import path from 'path'
import iosHeaderCreator from './objective-c-header-creator'
import schema from 'protocol-buffers-schema'
import ios from './objective-c-parser'

export default (protoFile: string) => {
  const protoFileName = path.basename(protoFile, path.extname(protoFile))

  const file = fs.readFileSync(protoFile, 'utf-8')

  const fileSchema = schema.parse(file)
  const iosBridgeFile = ios(fileSchema)
  const iosBridgeHeaderFile = iosHeaderCreator(protoFileName)

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }

  fs.writeFileSync(`output/${protoFileName}.h`, iosBridgeHeaderFile, {encoding: 'utf-8'})
  fs.writeFileSync(`output/${protoFileName}.m`, iosBridgeFile, {encoding: 'utf-8'})
  console.log('')
  console.log('')
  console.log(iosBridgeFile)
}
