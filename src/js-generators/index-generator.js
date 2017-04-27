// @flow

import camelcase from 'lodash.camelcase'

import type { Schema } from '../types'

export const template = (serviceName: string) => `
// @flow

import * as actions from './actions'
import * as actionTypes from './action-types'
import * as apiClient from './api-client'

const ${camelcase(serviceName)} = {
  actions,
  actionTypes,
  apiClient
}

module.exports = ${camelcase(serviceName)}

`.trim()

export default (schema: Schema) => {
  return template(schema.services[0].name)
}
