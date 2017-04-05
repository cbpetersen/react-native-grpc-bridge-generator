// @flow

export default (name: string) =>
`
@import Foundation;
#import <React/RCTBridgeModule.h>

@interface ${name}: NSObject <RCTBridgeModule>

@end
`.trim()
