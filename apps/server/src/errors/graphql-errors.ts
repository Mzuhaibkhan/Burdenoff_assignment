import { GraphQLError } from 'graphql';

export class ValidationError extends GraphQLError {
  constructor(message: string, field?: string) {
    super(message, {
      extensions: {
        code: 'VALIDATION_ERROR',
        ...(field && { field }),
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(entity: string, id?: string) {
    super(`${entity} not found${id ? `: ${id}` : ''}`, {
      extensions: { code: `${entity.toUpperCase().replace(' ', '_')}_NOT_FOUND` },
    });
  }
}

export class UnauthorizedError extends GraphQLError {
  constructor(message = 'Authentication required') {
    super(message, {
      extensions: { code: 'UNAUTHORIZED' },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export class InvalidTransitionError extends GraphQLError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`, {
      extensions: {
        code: 'INVALID_STATUS_TRANSITION',
        from,
        to,
      },
    });
  }
}

export class DuplicateError extends GraphQLError {
  constructor(entity: string, field: string) {
    super(`${entity} with this ${field} already exists`, {
      extensions: { code: 'DUPLICATE_ENTRY', field },
    });
  }
}
