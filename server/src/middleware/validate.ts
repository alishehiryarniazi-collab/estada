/**
 * Generic request-validation middleware.
 *
 * Usage: validate({ body: someSchema, query: otherSchema })
 * On success it REPLACES req.body/req.query with the parsed (typed, sanitised)
 * data. On failure the ZodError bubbles to the global error handler, which
 * returns a 400 with field-level messages.
 */
import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (err) {
      next(err);
    }
  };
}
