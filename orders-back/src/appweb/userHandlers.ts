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

export async function handleGetUsers(c: Components, req: express.Request, res: express.Response) {
  res.json(await users.queryUsers(c.storage, req.caller));
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

  const userID = await users.createUser(c.storage, c.passwordService, req.caller,
                                        viewModel.userIdName, permissions, viewModel.password,
                                        viewModel.userFullName, viewModel.telNumber);
  res.status(201).location('/users/' + userID).send();
}

export async function handlePostUserLogin(c: Components, req: express.Request,
                                          res: express.Response) {
  const viewModel = deserialize<LoginUserViewModel>(req.body, LoginUserViewModelSchema);

  const tokenAndRole = await users.loginUser(c.storage, c.passwordService, c.tokenizationService,
                                             viewModel.userIDName, viewModel.password);

  res.json(tokenAndRole);
}

export async function handlePostUserDisable(c: Components, req: express.Request,
                                            res: express.Response) {}

export async function handlePostUserEnable(c: Components, req: express.Request,
                                           res: express.Response) {}
