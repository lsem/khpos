import * as pos from "app/pos";
import {deserialize, serialize} from "app/serialize";
import express from "express";
import {Caller} from "types/Caller";
import {EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";
import {CreatePOSViewModel, CreatePOSViewModelSchema} from "types/viewModels";
import {Components, handlerWrapper} from "webMain";

export function registerPOSHandlers(expressApp: express.Application, c: Components) {
  expressApp.get("/pos", handlerWrapper(handleGetPOS, c));
  expressApp.get("/pos/:id", handlerWrapper(handleGetSinglePOS, c));
  expressApp.post("/pos", handlerWrapper(handlePostPOS, c));
}

const AdminCaller = new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

export async function handleGetPOS(c: Components, req: express.Request, res: express.Response) {
  const allPOS = await pos.queryAllPOS(c.storage, AdminCaller);
  res.json(allPOS);
}

export async function handleGetSinglePOS(c: Components, req: express.Request,
                                         res: express.Response) {
  // todo: missing caller!
  const posID = EIDFac.fromExisting(req.params.id);
  res.json(await pos.getPOSByID(c.storage, posID));
}

export async function handlePostPOS(c: Components, req: express.Request, res: express.Response) {
  const viewModel = deserialize<CreatePOSViewModel>(req.body, CreatePOSViewModelSchema);
  // todo: missing caller!
  const id = await pos.createPOS(c.storage, viewModel.posIDName);
  res.status(201).location('/pos/' + id).send();
}
