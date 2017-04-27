#!/usr/bin/env babel-node

// @flow

require('babel-register')({
  ignore: /node_modules\/(?!protobuf-to-react-native-bridge-bindings)/
})
var argv = require('yargs')
    .count('verbose')
    .alias('v', 'verbose').argv

var fileHandler = require('./src/fileHandler')

fileHandler(argv)
