import {BadArgsError} from 'app/errors';
import * as orders from 'app/orders';
import {deserialize, serialize} from "app/serialize";
import express from "express";
import {Caller} from "types/Caller";
import {Day, EIDFac} from "types/core_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";
import {ChangeDayViewModel, ChangeDayViewModelSchema} from 'types/viewModels';
import {Components, handlerWrapper} from "webMain";

export function registerOrdersHandlers(expressApp: express.Application, c: Components) {
  expressApp.get("/dayorder/:pos/", handlerWrapper(handleGetOrderForDay, c));
  expressApp.patch("/dayorder/:pos/", handlerWrapper(handlePatchOrderForDay, c));
  expressApp.post("/dayorder/:pos/open", handlerWrapper(handlePostOpenDay, c));
  expressApp.post("/dayorder/:pos/close", handlerWrapper(handlePostCloseDay, c));
  expressApp.post("/dayorder/:pos/finalize", handlerWrapper(handlePostFinalizeDay, c));
}

function parseDate(value: string) {
  if (!value) {
    throw new BadArgsError("date value is not defined or null");
  }
  const parsed = Date.parse(value);
  if (isNaN(parsed)) {
    throw new BadArgsError("Parsing date failed");
  }
  return new Date(parsed)
}

const AdminCaller = new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

function idParam(v: string) { return EIDFac.fromExisting(v); }

function dayParam(v: any) { return Day.fromDate(parseDate(v as string)); }

export async function handleGetOrderForDay(c: Components, req: express.Request,
                                           res: express.Response) {

  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  const dayView = await orders.getDay(c.storage, AdminCaller, day, posID);
  res.json(dayView);
}

export async function handlePatchOrderForDay(c: Components, req: express.Request,
                                             res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  const changeDayView = deserialize<ChangeDayViewModel>(req.body, ChangeDayViewModelSchema);
  await orders.changeDay(c.storage, AdminCaller, day, posID, changeDayView);
  res.send(200);
}

export async function handlePostOpenDay(c: Components, req: express.Request,
                                        res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.openDay(c.storage, AdminCaller, day, posID);
  res.send(200);
}

export async function handlePostCloseDay(c: Components, req: express.Request,
                                         res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.closeDay(c.storage, AdminCaller, day, posID);
  res.send(200);
}

export async function handlePostFinalizeDay(c: Components, req: express.Request,
                                            res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.finalizeDay(c.storage, AdminCaller, day, posID);
  res.send(200);
}
