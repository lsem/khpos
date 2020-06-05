import {assert, expect} from "chai";
import {example} from "joi";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {Day, EID} from "types/core_types";
import {POSModel} from "types/domain_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import {NotAllowed, NotFoundError} from "./errors";
import * as orders from "./orders";
import * as pos from "./pos";

const AnyUserPermissions = new UserPermissions(PermissionFlags.None, []);

describe("[orders]", () => {
  it("validates input dates", async () => {
    const storage = new InMemoryStorage();
    try {
      await orders.getOrdersForDate(storage, new Date("some garbage"));
      assert.fail("This should not be called");
    } catch (err) {
    }
  });

  it("should support basic scenario", async () => {
    const storage = new InMemoryStorage();
    const product1 = EID.makeGoodID();
    storage.insertGood(product1, {
      id : product1,
      name : "Круасан з Моколадом",
      units : "it",
      available : true,
      removed : false
    });

    const product2 = EID.makeGoodID();
    storage.insertGood(product2, {
      id : product2,
      name : "Шарлотка по Франківськи",
      units : "it",
      available : true,
      removed : false
    });

    // Create some user User1.
    const user1ID = EID.makeUserID();
    storage.insertUser(user1ID, {
      userID : user1ID,
      userIdName : "nat",
      userFullName : "Наталія Панфорте",
      telNumber : "",
      permissions : AnyUserPermissions
    });

    // Create some POS where user nat works.
    const pos1ID = EID.makePOSID();
    storage.insertPointOfSale(pos1ID, {
      posIDName : "ЮЛипи",
      posID : pos1ID,
    });

    // Create another User2.
    const user2ID = EID.makeUserID();
    storage.insertUser(user2ID, {
      userID : user2ID,
      userIdName : "nat",
      userFullName : "Зоя Маріуполь",
      telNumber : "",
      permissions : AnyUserPermissions
    });

    // Create another POS where zoya works.
    const pos2ID = EID.makePOSID();
    storage.insertPointOfSale(pos2ID, {
      posIDName : "Чупринки",
      posID : pos2ID,
    });

    // User1 places its order for some day.
    const order1ID = await orders.placeOrder(storage, {
      whoPlaced : user1ID,
      toDate : new Date("2020-05-28"),
      posID : pos1ID,
      items : [
        {
          id : product1,
          count : 10,
        },
        {
          id : product2,
          count : 100,
        },
      ],
    });

    // User1 places its order for some day.
    const order2ID = await orders.placeOrder(storage, {
      whoPlaced : user1ID,
      toDate : new Date("2020-05-28"),
      posID : pos2ID,
      items : [
        {
          id : product1,
          count : 50,
        },
      ],
    });

    // getOrdersForDate returns orders for the specifid date.
    assert.deepEqual(await orders.getOrdersForDate(storage, new Date("2020-05-28")), {
      toDate : new Date("2020-05-28"),
      items : [
        {
          productName : "Круасан з Моколадом",
          productID : product1,
          count : 60,
          details : [
            {count : 10, posID : pos1ID, posIDName : "ЮЛипи"},
            {count : 50, posID : pos2ID, posIDName : "Чупринки"},
          ],
        },
        {
          productName : "Шарлотка по Франківськи",
          productID : product2,
          count : 100,
          details : [ {count : 100, posID : pos1ID, posIDName : "ЮЛипи"} ],
        },
      ],
    });

    // json example
    // console.log(JSON.stringify(await orders.getOrdersForDate(storage, new Date("2020-05-28"))));
  });

  it("basic test for placing order", async () => {
    const storage = new InMemoryStorage();

    const POS = EID.makePOSID();
    await storage.insertPointOfSale(POS, {posID : POS, posIDName : "Чупринки"});

    const natashaTheUser =
        new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS ]));

    const sharlotteID = EID.makeGoodID();
    await storage.insertGood(
        sharlotteID,
        {id : sharlotteID, name : "Шарлотка", available : true, removed : true, units : "шт"});
    const panforteID = EID.makeGoodID();
    await storage.insertGood(
        panforteID,
        {id : panforteID, name : "Панфорте", available : true, removed : true, units : "шт"});

    const today = Day.fromDate(new Date());

    // Open day corresponds to similar button on UI.
    await orders.openDay(storage, natashaTheUser, today, POS);

    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 0},
        {goodID : panforteID, goodName : "Панфорте", ordered : 0}
      ]
    });

    await orders.changeDay(storage, natashaTheUser, today, POS,
                                   {items : [ {goodID : panforteID, ordered : 5} ]});

    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 0},
        {goodID : panforteID, goodName : "Панфорте", ordered : 5}
      ]
    });

    await orders.changeDay(
        storage, natashaTheUser, today, POS,
        {items : [ {goodID : panforteID, ordered : 2}, {goodID : sharlotteID, ordered : 1} ]});

    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 1},
        {goodID : panforteID, goodName : "Панфорте", ordered : 2}
      ]
    });
  });

  it("should apply operations only to specified POS", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EID.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const POS2 = EID.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Липи"});

    const natashaTheUser = new Caller(
        EID.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1, POS2 ]));

    const today = Day.fromDate(new Date());

    // Natasha opens a day for pos1.
    await orders.openDay(storage, natashaTheUser, today, POS1);

    // Day for POS1 is opened, but for POS2 is not.
    await orders.getDay(storage, natashaTheUser, today, POS1);

    // Day for POS1 is opened, but for POS2 is not.
    await expect(orders.getDay(storage, natashaTheUser, today, POS2))
        .to.be.rejectedWith(NotFoundError);

    // Natasha opens a day for pos2.
    await orders.openDay(storage, natashaTheUser, today, POS2);

    // Now pos2 day is opened.
    await orders.getDay(storage, natashaTheUser, today, POS2);
  });

  // todo: test for opening already opened day.

  it("should check access to APIs", async () => {
    const storage = new InMemoryStorage();

    // POSs
    const POS1 = EID.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const POS2 = EID.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Липи"});

    const POS3 = EID.makePOSID();
    await storage.insertPointOfSale(POS3, {posID : POS3, posIDName : "Левицького"});

    // Users/Callers
    const natashaTheUser =
        new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS2 ]));
    const nastiaTheUser =
        new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1 ]));
    const adminUser = new Caller(EID.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    // Goods
    const sharlotteID = EID.makeGoodID();
    await storage.insertGood(
        sharlotteID,
        {id : sharlotteID, name : "Шарлотка", available : true, removed : true, units : "шт"});
    const panforteID = EID.makeGoodID();
    await storage.insertGood(
        panforteID,
        {id : panforteID, name : "Панфорте", available : true, removed : true, units : "шт"});

    const today = Day.fromDate(new Date());

    // Natasha has access to POS2
    await orders.openDay(storage, natashaTheUser, today, POS2);

    // Nastia does not have access POS2
    await expect(orders.openDay(storage, nastiaTheUser, today, POS2))
        .to.be.rejectedWith(NotAllowed);

    // Natasha can make changes for POS2
    await orders.changeDay(storage, natashaTheUser, today, POS2,
                                   {items : [ {goodID : panforteID, ordered : 5} ]});

    // Nastia can't make changes for POS2
    await expect(orders.changeDay(storage, nastiaTheUser, today, POS2, {
      items : [ {goodID : panforteID, ordered : 5} ]
    })).to.be.rejectedWith(NotAllowed);

    // Admins allowed to change anything
    await orders.openDay(storage, adminUser, today, POS3);
    await orders.changeDay(storage, adminUser, today, POS2,
                                   {items : [ {goodID : panforteID, ordered : 5} ]});
  });
});
