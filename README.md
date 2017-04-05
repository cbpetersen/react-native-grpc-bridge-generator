# React native grpc protobuf to bridge transpiler

Creating multiple mappers and briges for react native to a grpc service is painful so we created this tool to ease the development pain and automate the step.

## Getting Started

To create the brige file run

```$ babel test/test-samples/grpc-sample.proto```

this will create a file named `ios.m` file ready to use as a bridge.

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

