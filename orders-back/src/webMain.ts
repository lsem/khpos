import * as errors from "app/errors";
import {registerOrdersHandlers} from "appweb/ordersHandlers";
import {registerPOSHandlers} from "appweb/posHandlers";
import cors from "cors";
import express from "express";
import * as http from 'http';
import morgan from "morgan";
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";
import {EIDFac} from "types/core_types";

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
  } else if (err instanceof errors.BadArgsError) {
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

function populateSampleGoods(storage: AbstractStorage) {
  const addGood = (name: string, units: string) => {
    const gid = EIDFac.makeGoodID();
    storage.insertGood(gid,
                       {id : gid, name : name, units : units, available : true, removed : false});
  };
  addGood("Домашній хліб", "шт");
  addGood("Жорновий хліб", "шт");
  addGood("Буряковий", "шт");
  addGood("Заварний", "шт");
  addGood("Культовий", "шт");
  addGood("Хліб Бріош", "шт");
  addGood("Хліб Французький", "шт");
  addGood("Цільнозерновий", "шт");
  addGood("Чіабата класична", "шт");
  addGood("Вишневий пиріг", "шт");
  addGood("Кекс гарбузовий", "шт");
  addGood("Мафін шоколад", "шт");
  addGood("Мафін ягідний", "шт");
  addGood("Сирник", "шт");
  addGood("Смородиновий тарт", "шт");
  addGood("Тарт чорнич.", "шт");
  addGood("Фінський чорнич.", "шт");
  addGood("Тартал. з лим. курд.", "шт");
  addGood("Чіа з манго", "шт");
  addGood("Чіа смузі апельсинов.", "шт");
  addGood("Круасан пустий", "шт");
  addGood("Круасан мигдалевий", "шт");
  addGood("Начинка вишня", "шт");
  addGood("Шоколадне печиво", "шт");
  addGood("Кокосові хмаринки", "шт");
  addGood("Моршинська сл.г. 0,33", "шт");
  addGood("Пакети паперові середні", "шт");
  addGood("Конт. квадр. малий", "шт");
  addGood("Кава", "уп");
}

if (require.main === module) {
  const storage = new InMemoryStorage();
  populateSampleGoods(storage);
  const app = express();
  app.use(cors());
  app.use(morgan(":date[iso] :method :url :status :response-time[digits] ms"));
  app.use(express.json());
  registerPOSHandlers(app, {storage : storage});
  registerOrdersHandlers(app, {storage : storage});
  app.use(errorHandler);
  const server = http.createServer(app);
  server.listen(5500, () => console.log(`is running at http://localhost:5500`));
}
