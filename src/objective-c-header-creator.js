// @flow

export default (name: string) => {
  const output = []

  output.push(`@import Foundation;`)
  output.push(`#import <React/RCTBridgeModule.h>`)
  output.push(``)
  output.push(`@interface ${name}Service : NSObject <RCTBridgeModule>`)
  output.push(``)
  output.push(`@end`)
  output.push(``)

  return output.join('\n')
}

