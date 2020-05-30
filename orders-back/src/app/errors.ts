// Defines classes of errors that we want to distinguish. Keep minimal.

export class AuthorizationError extends Error {
  constructor(message: string) { super(message); }
}

export class NeedsAdminError extends AuthorizationError {
  constructor() { super('NeedsAdminError'); }
}

export class AlreadyExistsError extends Error {
  constructor() { super('AlreadyExistsError'); }
}

export class NotFoundError extends Error {
  constructor() { super('NotFoundError'); }
}

export class ValidationError extends Error {
  constructor(details: string) { super('ValidationError: ' + details); }
}
