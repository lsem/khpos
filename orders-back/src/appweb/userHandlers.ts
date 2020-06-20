import {BadArgsError, NotFoundError} from "app/errors";
import {BcryptPasswordService} from "app/password_service";
import {deserialize} from "app/serialize";
import * as users from "app/users";
import express from "express";
import {Caller} from "types/Caller";
import {EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";
import {
  CreateUserViewModel,
  CreateUserViewModelSchema,
  LoginUserViewModel,
  LoginUserViewModelSchema
} from "types/viewModels";
import {Components, handlerWrapper} from "webMain";

export function registerUsersHandlers(expressApp: express.Application, c: Components) {
  expressApp.get("/users", handlerWrapper(handleGetUsers, c));
  expressApp.post("/users", handlerWrapper(handlePostUser, c));
  expressApp.post("/users/:id/disable", handlerWrapper(handlePostUserDisable, c));
  expressApp.post("/users/:id/enable", handlerWrapper(handlePostUserEnable, c));
  expressApp.post("/users/login", handlerWrapper(handlePostUserLogin, c));
}
// todo: add change user, get user.

const AdminCaller = new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

export async function handleGetUsers(c: Components, req: express.Request, res: express.Response) {
  res.json(await users.queryUsers(c.storage, AdminCaller));
}

export async function handlePostUser(c: Components, req: express.Request, res: express.Response) {
  const viewModel = deserialize<CreateUserViewModel>(req.body, CreateUserViewModelSchema);

  const permissions = (() => {
    if (viewModel.role == 'Admin') {
      return new UserPermissions(PermissionFlags.Admin, []);
    } else if (viewModel.role == 'ProdStuff') {
      return new UserPermissions(PermissionFlags.IsProdStaff, []);
    } else if (viewModel.role == 'ShopManager') {
      return new UserPermissions(PermissionFlags.IsShopManager, []);
    } else {
      throw new BadArgsError("Invalid role");
    }
  })();

  const userID = await users.createUser(c.storage, c.passwordService, AdminCaller,
                                        viewModel.userIdName, permissions, viewModel.password,
                                        viewModel.userFullName, viewModel.telNumber);
  res.status(201).location('/users/' + userID).send();
}

export async function handlePostUserLogin(c: Components, req: express.Request,
                                          res: express.Response) {

  // to log into the system, we expect that client sent login info: userId and password.
  // we look up into the database for password hash and compare it with hashed
  // value of user password. if they match, we generate new token which holds
  // user permissions as payload and

  const viewModel = deserialize<LoginUserViewModel>(req.body, LoginUserViewModelSchema);

  // find user by name.
  // todo: consider refactoring to make storage raise exception for this case.
  const mayBeUser = await c.storage.findUserByIdName(viewModel.userIDName);
  if (!mayBeUser) {
    throw new NotFoundError(`User with idname ${viewModel.userIDName} not found`);
  }

  const token = await users.loginUser(c.storage, c.passwordService, c.tokenizationService,
                                      mayBeUser!.userID, viewModel.password);

  res.json({token : token});
}

export async function handlePostUserDisable(c: Components, req: express.Request,
                                            res: express.Response) {}

export async function handlePostUserEnable(c: Components, req: express.Request,
                                           res: express.Response) {}
