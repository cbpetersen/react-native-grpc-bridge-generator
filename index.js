// @flow

import { argv } from 'yargs'
import fileHandler from './src/fileHandler'

fileHandler(argv._[0])
