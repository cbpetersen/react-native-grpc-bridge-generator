# React native grpc protobuf to bridge transpiler

[![Build Status](https://travis-ci.org/drivr/react-native-grpc-bridge-generator.svg?branch=master)](https://travis-ci.org/drivr/react-native-grpc-bridge-generator)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![codecov](https://codecov.io/gh/drivr/react-native-grpc-bridge-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/drivr/react-native-grpc-bridge-generator)

Creating multiple mappers and briges for react native to a grpc service is painful so we created this tool to ease the development pain and automate the procedure.

## Getting Started

To create the brige file run

```
$ babel test-samples/grpc-sample.proto
```

This will create a files ready to use for communication

```
output/grpcSample.h
output/grpcSample.m
output/grpcSample-action-types.js
output/grpcSample-flow-types.js
output/grpcSample-actions.js
output/grpcSample-react-native-api-client.js
```

## Next Steps

Make mappings for Android and all primitive types.

## Contributing

Feel free to create PR's and issues.

### Git conventions

To ensure we can generate a changelog automatically we use the following conventions

- Commit messages should all be grouped into a category defined by [gitmoji](https://gitmoji.carloscuesta.me/)
- Style guide described by [Chris Beams](http://chris.beams.io/posts/git-commit/)

An example of a message adding a new feature would be

    git commit -m ':sparkles: Add cool new feature'

