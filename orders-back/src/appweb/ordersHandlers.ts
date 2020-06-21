import {BadArgsError} from 'app/errors';
import * as orders from 'app/orders';
import {deserialize} from "app/serialize";
import express from "express";
import {Day, EIDFac} from "types/core_types";
import {
  ChangeDayViewModel,
  ChangeDayViewModelSchema,
  ConfirmChangeViewModel,
  ConfirmChangeViewModelSchema
} from 'types/viewModels';
import {Components, handlerWrapper} from "webMain";

// todo: get rid of this userID thing.
export function registerOrdersHandlers(expressApp: express.Application, c: Components) {
  expressApp.get("/dayorder/:pos/", handlerWrapper(handleGetOrderForDay, c));
  expressApp.patch("/dayorder/:pos/", handlerWrapper(handlePatchOrderForDay, c));
  expressApp.post("/dayorder/:pos/open", handlerWrapper(handlePostOpenDay, c));
  expressApp.post("/dayorder/:pos/close", handlerWrapper(handlePostCloseDay, c));
  expressApp.post("/dayorder/:pos/finalize", handlerWrapper(handlePostFinalizeDay, c));
  expressApp.post("/dayorder/:pos/confirmChange", handlerWrapper(handlePostConfirmChange, c));
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

function idParam(v: string) { return EIDFac.fromExisting(v); }

function dayParam(v: any) { return Day.fromDate(parseDate(v as string)); }

export async function handleGetOrderForDay(c: Components, req: express.Request,
                                           res: express.Response) {

  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  const dayView = await orders.getDay(c.storage, req.caller, day, posID);
  res.json(dayView);
}

export async function handlePatchOrderForDay(c: Components, req: express.Request,
                                             res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  const changeDayView = deserialize<ChangeDayViewModel>(req.body, ChangeDayViewModelSchema);
  await orders.changeDay(c.storage, req.caller, day, posID, changeDayView);
  res.send(200);
}

export async function handlePostOpenDay(c: Components, req: express.Request,
                                        res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.openDay(c.storage, req.caller, day, posID);
  res.send(200);
}

export async function handlePostCloseDay(c: Components, req: express.Request,
                                         res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.closeDay(c.storage, req.caller, day, posID);
  res.send(200);
}

export async function handlePostFinalizeDay(c: Components, req: express.Request,
                                            res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  await orders.finalizeDay(c.storage, req.caller, day, posID);
  res.send(200);
}

export async function handlePostConfirmChange(c: Components, req: express.Request,
                                              res: express.Response) {
  const posID = idParam(req.params.pos);
  const day = dayParam(req.query.day);
  const confirmViewModel =
      deserialize<ConfirmChangeViewModel>(req.body, ConfirmChangeViewModelSchema);
  await orders.confirmChanges(c.storage, req.caller, day, posID, confirmViewModel);
  res.send(200);
}
