// Defines classes of errors that we want to distinguish. Keep minimal.

export class AuthorizationError extends Error {
  constructor(message: string) { super(message); }
}

export class NeedsAdminError extends AuthorizationError {
  constructor() { super('NeedsAdminError'); }
}

export class NotAllowedError extends AuthorizationError {
  constructor(what: string = "") { super(`NotAllowedError: ${what}`); }
}

export class AlreadyExistsError extends Error {
  constructor() { super('AlreadyExistsError'); }
}

export class NotFoundError extends Error {
  constructor(what: string = "") { super(`NotFoundError: ${what}`); }
}

export class ValidationError extends Error {
  constructor(details: string) { super('ValidationError: ' + details); }
}

export class InvalidOperationError extends Error {
  constructor(what: string) { super(`InvalidOperationError: ${what}`); }
}
