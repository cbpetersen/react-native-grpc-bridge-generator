// @flow

export const moduleName = (name: string) => `${name}BridgeModule`

export const fileName = (name: string) => moduleName(name)

export const mapReservedKeyword = (fieldName: string) => {
  switch (fieldName) {
    case 'id':
      return 'id_p'

    default:
      return fieldName
  }
}

export const indent = (length: number) => ' '.repeat(length)
export const append = (index: number, length: number) => isLast(index, length) ? '' : ','
export const isLast = (index, length) => index >= length - 1