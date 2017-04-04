import fs from 'fs'
var args = require('yargs').argv
import ios from './src/objective-c-parser'
var schema = require('protocol-buffers-schema')

console.log(args._)

const file = fs.readFileSync(args._[0], 'utf-8')
const fileSchema = schema.parse(file)
const iosResult = ios(fileSchema)

if (!fs.existsSync('output')) {
  fs.mkdirSync('output')
}

fs.writeFileSync('./output/ios.m', iosResult, {encoding: 'utf-8'})
console.log('')
console.log('')
console.log(iosResult)
