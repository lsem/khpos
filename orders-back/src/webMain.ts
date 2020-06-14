import * as errors from "app/errors";
import {createUser} from "app/users";
import {registerOrdersHandlers} from "appweb/ordersHandlers";
import {registerPOSHandlers} from "appweb/posHandlers";
import cors from "cors";
import express from "express";
import * as http from 'http';
import morgan from "morgan";
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

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

const GlobalAdminCaller =
    new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

let SampleAdminUserID: string;

async function populateSampleEntities(storage: AbstractStorage) {
  SampleAdminUserID = await createUser(storage, GlobalAdminCaller, "Роман",
                                       new UserPermissions(PermissionFlags.Admin, []),
                                       "Роман Антонович", "+380959113456");

  const addPOS = async (
      name: string,
      pid: string) => { await storage.insertPointOfSale(pid, {posID : pid, posIDName : name}); };

  await addPOS("Чупринки", "POS-a8b69a9c-9c85-48d5-a8f0-9d213b1ee866");
  await addPOS("ЮЛипи", "POS-4f224ac9-620e-4a78-bbe2-8978e4e41cac");
  await addPOS("Стрийська", "POS-8ed2405f-e973-4c14-aa57-f96d23852858");

  const addGood = async (name: string, units: string) => {
    const gid = EIDFac.makeGoodID();
    await storage.insertGood(
        gid, {id : gid, name : name, units : units, available : true, removed : false});
  };
  await addGood("Домашній хліб", "шт");
  await addGood("Жорновий хліб", "шт");
  await addGood("Буряковий", "шт");
  await addGood("Заварний", "шт");
  await addGood("Культовий", "шт");
  await addGood("Хліб Бріош", "шт");
  await addGood("Хліб Французький", "шт");
  await addGood("Цільнозерновий", "шт");
  await addGood("Чіабата класична", "шт");
  await addGood("Вишневий пиріг", "шт");
  await addGood("Кекс гарбузовий", "шт");
  await addGood("Мафін шоколад", "шт");
  await addGood("Мафін ягідний", "шт");
  await addGood("Сирник", "шт");
  await addGood("Смородиновий тарт", "шт");
  await addGood("Тарт чорнич.", "шт");
  await addGood("Фінський чорнич.", "шт");
  await addGood("Тартал. з лим. курд.", "шт");
  await addGood("Чіа з манго", "шт");
  await addGood("Чіа смузі апельсинов.", "шт");
  await addGood("Круасан пустий", "шт");
  await addGood("Круасан мигдалевий", "шт");
  await addGood("Начинка вишня", "шт");
  await addGood("Шоколадне печиво", "шт");
  await addGood("Кокосові хмаринки", "шт");
  await addGood("Моршинська сл.г. 0,33", "шт");
  await addGood("Пакети паперові середні", "шт");
  await addGood("Конт. квадр. малий", "шт");
  await addGood("Кава", "уп");
}

async function main() {
  const storage = new InMemoryStorage();
  await populateSampleEntities(storage)
  const app = express();
  app.use(cors());
  app.use(morgan(":date[iso] :method :url :status :response-time[digits] ms"));
  app.use(express.json());
  registerPOSHandlers(app, {storage : storage});
  registerOrdersHandlers(app, {storage : storage}, SampleAdminUserID);
  app.use(errorHandler);
  const server = http.createServer(app);
  server.listen(5500, () => console.log(`is running at http://localhost:5500`));
}

if (require.main === module) {
  main();
}
