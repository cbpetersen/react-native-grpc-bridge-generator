// @flow

export const fileTemplate = (imports: string, exports: string) => `
// @flow

${imports}

module.exports = {
${exports}
}
`.trim()

export const importTemplate = (fileName: string) => `
const ${fileName} = require('./${fileName}')
`.trim()

export const exportTemplate = (fileName: string) => `  ${fileName}: ${fileName}`

export default (fileNames: string[]) => {
  const imports = []
  const exports = []
  fileNames.forEach((fileName) => {
    imports.push(importTemplate(fileName))
    exports.push(exportTemplate(fileName))
  })

  return fileTemplate(imports.join('\n'), exports.join(',\n'))
}
