import * as errors from "app/errors";
import {registerPOSHandlers} from "appweb/posHandlers";
import cors from "cors";
import express from "express";
import * as http from 'http';
import morgan from "morgan";
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";

export interface Components {
  storage: AbstractStorage;
}

export type HandlerFn = (c: Components, req: express.Request, res: express.Response) =>
    Promise<void>;
export function handlerWrapper(handler: HandlerFn, c: Components) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await handler(c, req, res);
    } catch (err) {
      next(err);
    }
  }
}

export function mapErrorToHTTP(err: Error): number {
  if (err instanceof errors.NotFoundError) {
    return 404;
  } else if (err instanceof errors.ValidationError) {
    return 400;
  } else if (err instanceof errors.InvalidOperationError) {
    return 400;
  } else if (err instanceof errors.AlreadyExistsError) {
    return 409;
  } else if (err instanceof errors.NotAllowedError) {
    return 401;
  } else if (err instanceof errors.NeedsAdminError) {
    return 401;
  } else if (err instanceof errors.AuthorizationError) {
    return 401;
  } else {
    return 501;
  }
}

function errorHandler(err: any, req: express.Request, res: express.Response,
                      next: express.NextFunction) {
  res.status(mapErrorToHTTP(err)).send(err.message);
}

if (require.main === module) {
  const storage = new InMemoryStorage();
  const app = express();
  app.use(cors());
  app.use(morgan("tiny"));
  app.use(express.json());
  registerPOSHandlers(app, {storage : storage});
  app.use(errorHandler);
  const server = http.createServer(app);
  server.listen(5500, () => console.log(`is running at http://localhost:5500`));
}
