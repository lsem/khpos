import * as errors from "app/errors";
import {BcryptPasswordService, IPasswordService} from "app/password_service";
import {ITokenizationService, JWTTokenizationService, TokenData} from "app/tokenization_service";
import {createUser} from "app/users";
import {registerOrdersHandlers} from "appweb/ordersHandlers";
import {registerPOSHandlers} from "appweb/posHandlers";
import {registerUsersHandlers} from "appweb/userHandlers";
import cors from "cors";
import express from "express";
import * as http from 'http';
import {JsonWebTokenError} from "jsonwebtoken";
import morgan from "morgan";
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

export interface Components {
  storage: AbstractStorage;
  passwordService: IPasswordService;
  tokenizationService: ITokenizationService;
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
  } else if (err instanceof errors.InvalidCredentialsError) {
    return 401;
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

// We are going to extend express.Request with unpacked token.
declare global {
  namespace Express {
  interface Request {
    tokenData: TokenData;
    caller: Caller;
  }
  }
}
type MiddlewareCallback =
    (req: express.Request, res: express.Response, next: express.NextFunction) => void;
function makeAuthMiddlaware(tokenizationService: ITokenizationService): MiddlewareCallback {
  return (req, res, next) => {
    if (req.path !== '/users/login') {
      if (!req.headers['authorization']) {
        throw new errors.AuthorizationError("No authorization header");
      }
      req.tokenData = tokenizationService.unpackToken(req.headers['authorization']);
      req.caller =
          new Caller(req.tokenData.id, new UserPermissions(req.tokenData.permissions.mask,
                                                           req.tokenData.permissions.resources));
    }
    next();
  };
}

function errorHandler(err: any, req: express.Request, res: express.Response,
                      next: express.NextFunction) {
  res.status(mapErrorToHTTP(err)).send(err.message);
}

// Initial seed user to init application.
const GlobalAdminCaller =
    new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

async function populateSampleEntities(c: Components) {
  const addPOS = async (
      name: string,
      pid: string) => { await c.storage.insertPointOfSale(pid, {posID : pid, posIDName : name}); };

  const pos1ID = "POS-a8b69a9c-9c85-48d5-a8f0-9d213b1ee866";
  const pos2ID = "POS-4f224ac9-620e-4a78-bbe2-8978e4e41cac";
  const pos3ID = "POS-8ed2405f-e973-4c14-aa57-f96d23852858";
  await addPOS("Чупринки", pos1ID);
  await addPOS("ЮЛипи", pos2ID);
  await addPOS("Стрийська", pos3ID);

  await createUser(c.storage, c.passwordService, GlobalAdminCaller, "Роман",
                   new UserPermissions(PermissionFlags.Admin, []), "secret", "Роман Антонович",
                   "+380959113456");

  await createUser(c.storage, c.passwordService, GlobalAdminCaller, "Наташа",
                   new UserPermissions(PermissionFlags.IsShopManager, [ pos1ID ]), "secret2",
                   "Наталія Овчар", "+380949113456");

  await createUser(c.storage, c.passwordService, GlobalAdminCaller, "Настя",
                   new UserPermissions(PermissionFlags.IsShopManager, [ pos2ID, pos3ID ]),
                   "secret3", "Настя Орел", "+380925113456");

  await createUser(c.storage, c.passwordService, GlobalAdminCaller, "Ігор",
                   new UserPermissions(PermissionFlags.IsProdStaff, []), "secret4", "Ігор Цех",
                   "+380925113456");

  const addGood = async (name: string, units: string) => {
    const gid = EIDFac.makeGoodID();
    await c.storage.insertGood(
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
  const components = {
    storage : new InMemoryStorage(),
    passwordService : new BcryptPasswordService(),
    tokenizationService : new JWTTokenizationService()
  };
  await populateSampleEntities(components)
  const app = express();
  app.use(cors());
  app.use(morgan(":date[iso] :method :url :status :response-time[digits] ms"));
  app.use(express.json());
  app.use(makeAuthMiddlaware(components.tokenizationService));
  registerPOSHandlers(app, components);
  registerOrdersHandlers(app, components);
  registerUsersHandlers(app, components);
  app.use(errorHandler);
  const server = http.createServer(app);
  server.listen(5500, () => console.log(`is running at http://localhost:5500`));
}

if (require.main === module) {
  main();
}
