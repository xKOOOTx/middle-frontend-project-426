/* eslint eslint-comments/no-unlimited-disable: off */
/* eslint-disable */
// This document was generated automatically by openapi-box

/**
 * @typedef {import('@sinclair/typebox').TSchema} TSchema
 */

/**
 * @template {TSchema} T
 * @typedef {import('@sinclair/typebox').Static<T>} Static
 */

/**
 * @typedef {import('@sinclair/typebox').SchemaOptions} SchemaOptions
 */

/**
 * @typedef {{
 *  [Path in keyof typeof schema]: {
 *    [Method in keyof typeof schema[Path]]: {
 *      [Prop in keyof typeof schema[Path][Method]]: typeof schema[Path][Method][Prop] extends TSchema ?
 *        Static<typeof schema[Path][Method][Prop]> :
 *        undefined
 *    }
 *  }
 * }} SchemaType
 */

/**
 * @typedef {{
 *  [ComponentType in keyof typeof _components]: {
 *    [ComponentName in keyof typeof _components[ComponentType]]: typeof _components[ComponentType][ComponentName] extends TSchema ?
 *      Static<typeof _components[ComponentType][ComponentName]> :
 *      undefined
 *  }
 * }} ComponentType
 */

import { Type as T, TypeRegistry, Kind, CloneType } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

/**
 * @typedef {{
 *  [Kind]: 'Binary'
 *  static: string | File | Blob | Uint8Array
 *  anyOf: [{
 *    type: 'object',
 *    additionalProperties: true
 *  }, {
 *    type: 'string',
 *    format: 'binary'
 *  }]
 * } & TSchema} TBinary
 */

/**
 * @returns {TBinary}
 */
const Binary = () => {
  /**
   * @param {TBinary} schema
   * @param {unknown} value
   * @returns {boolean}
   */
  function BinaryCheck(schema, value) {
    const type = Object.prototype.toString.call(value)
    return (
      type === '[object Blob]' ||
      type === '[object File]' ||
      type === '[object String]' ||
      type === '[object Uint8Array]'
    )
  }

  if (!TypeRegistry.Has('Binary')) TypeRegistry.Set('Binary', BinaryCheck)

  return /** @type {TBinary} */ ({
    anyOf: [
      {
        type: 'object',
        additionalProperties: true
      },
      {
        type: 'string',
        format: 'binary'
      }
    ],
    [Kind]: 'Binary'
  })
}

const ComponentsSchemasUser = T.Object({
  id: T.Integer({ format: 'int32' }),
  email: T.String(),
  createdAt: T.String({ format: 'date-time' })
})
const ComponentsSchemasApiError = T.Object({
  code: T.String(),
  message: T.String(),
  details: T.Optional(
    T.Object(
      {},
      {
        additionalProperties: {}
      }
    )
  )
})
const ComponentsSchemasLoginRequest = T.Object({
  email: T.String({ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }),
  password: T.String()
})
const ComponentsSchemasRegisterRequest = T.Object({
  email: T.String({ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }),
  password: T.String({ minLength: 8 })
})
const ComponentsSchemasHealthStatus = T.Object({
  status: T.Literal('ok')
})

const schema = {
  '/auth/login': {
    POST: {
      args: T.Object({
        body: CloneType(ComponentsSchemasLoginRequest, {
          'x-content-type': 'application/json'
        })
      }),
      data: CloneType(ComponentsSchemasUser, {
        'x-status-code': '200',
        'x-content-type': 'application/json'
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '401',
          'x-content-type': 'application/json'
        })
      ])
    }
  },
  '/auth/logout': {
    POST: {
      args: T.Void(),
      data: T.Any({ 'x-status-code': '204' }),
      error: T.Union([T.Any({ 'x-status-code': 'default' })])
    }
  },
  '/auth/me': {
    GET: {
      args: T.Void(),
      data: CloneType(ComponentsSchemasUser, {
        'x-status-code': '200',
        'x-content-type': 'application/json'
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '401',
          'x-content-type': 'application/json'
        })
      ])
    }
  },
  '/auth/register': {
    POST: {
      args: T.Object({
        body: CloneType(ComponentsSchemasRegisterRequest, {
          'x-content-type': 'application/json'
        })
      }),
      data: CloneType(ComponentsSchemasUser, {
        'x-status-code': '201',
        'x-content-type': 'application/json'
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '400',
          'x-content-type': 'application/json'
        }),
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '409',
          'x-content-type': 'application/json'
        })
      ])
    }
  },
  '/health': {
    GET: {
      args: T.Void(),
      data: CloneType(ComponentsSchemasHealthStatus, {
        'x-status-code': '200',
        'x-content-type': 'application/json'
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '500',
          'x-content-type': 'application/json'
        })
      ])
    }
  }
}

const _components = {
  schemas: {
    ApiError: CloneType(ComponentsSchemasApiError),
    HealthStatus: CloneType(ComponentsSchemasHealthStatus),
    LoginRequest: CloneType(ComponentsSchemasLoginRequest),
    Money: T.Integer({ format: 'int32', minimum: 0 }),
    RegisterRequest: CloneType(ComponentsSchemasRegisterRequest),
    User: CloneType(ComponentsSchemasUser)
  }
}

export { schema, _components as components }
