// @flow
import { moduleName } from '../utils'

export default (name: string) =>
`
@import Foundation;
#import <React/RCTBridgeModule.h>

@interface ${moduleName(name)}: NSObject <RCTBridgeModule>
- (instancetype)initWithHost:(NSString *)host NS_DESIGNATED_INITIALIZER;

@end
`.trim()
