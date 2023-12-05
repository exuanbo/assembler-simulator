const IS_ERROR_OBJECT = '__IS_ERROR_OBJECT'

export interface ErrorObject extends Error {
  [IS_ERROR_OBJECT]: true
}

export const errorToPlainObject = ({ name, message, stack }: Error): ErrorObject => {
  return {
    ...{ name, message, stack },
    [IS_ERROR_OBJECT]: true,
  }
}
