import {assert, expect} from "chai";
import _ from "lodash";
import {AbstractStorage} from "storage/AbstractStorage";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {Day, EID, EIDFac} from "types/core_types";
import {DayStatus} from "types/domain_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";
import util from 'util';

import {InvalidOperationError, NotAllowedError, NotFoundError} from "./errors";
import {createGood} from "./goods";
import * as orders from "./orders";
import {DayAggregate} from "./orders";
import * as pos from "./pos";
import * as users from "./users";

const AnyUserPermissions = new UserPermissions(PermissionFlags.None, []);

async function createUserAsCallerWithPermissions(storage: AbstractStorage,
                                                 permissions: UserPermissions) {
  const adminCaller =
      new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
  return new Caller(await users.createUser(storage, adminCaller, "Наташа", permissions,
                                           "Наталія Менеджерівна", "+380978763443"),
                    permissions);
}

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
    const product1 = EIDFac.makeGoodID();
    storage.insertGood(product1, {
      id : product1,
      name : "Круасан з Моколадом",
      units : "it",
      available : true,
      removed : false
    });

    const product2 = EIDFac.makeGoodID();
    storage.insertGood(product2, {
      id : product2,
      name : "Шарлотка по Франківськи",
      units : "it",
      available : true,
      removed : false
    });

    // Create some user User1.
    const user1ID = EIDFac.makeUserID();
    storage.insertUser(user1ID, {
      userID : user1ID,
      userIdName : "nat",
      userFullName : "Наталія Панфорте",
      telNumber : "",
      permissions : AnyUserPermissions
    });

    // Create some POS where user nat works.
    const pos1ID = EIDFac.makePOSID();
    storage.insertPointOfSale(pos1ID, {
      posIDName : "ЮЛипи",
      posID : pos1ID,
    });

    // Create another User2.
    const user2ID = EIDFac.makeUserID();
    storage.insertUser(user2ID, {
      userID : user2ID,
      userIdName : "nat",
      userFullName : "Зоя Маріуполь",
      telNumber : "",
      permissions : AnyUserPermissions
    });

    // Create another POS where zoya works.
    const pos2ID = EIDFac.makePOSID();
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

    const POS = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS, {posID : POS, posIDName : "Чупринки"});

    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const natashaPermissions = new UserPermissions(PermissionFlags.IsShopManager, [ POS ]);
    const NatashaCaller =
        new Caller(await users.createUser(storage, adminCaller, "Наташа", natashaPermissions,
                                          "Наталія Менеджерівна", "+380978763443"),
                   natashaPermissions);

    const sharlotteID = EIDFac.makeGoodID();
    await storage.insertGood(
        sharlotteID,
        {id : sharlotteID, name : "Шарлотка", available : true, removed : false, units : "шт"});
    const panforteID = EIDFac.makeGoodID();
    await storage.insertGood(
        panforteID,
        {id : panforteID, name : "Панфорте", available : true, removed : false, units : "шт"});

    const today = Day.fromDate(new Date());

    // Open day corresponds to similar button on UI.
    // await orders.openDay(storage, natashaTheUser, today, POS);

    await orders.openDay(storage, NatashaCaller, today, POS);

    assert.containSubset(await orders.getDay(storage, NatashaCaller, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 0},
        {goodID : panforteID, goodName : "Панфорте", ordered : 0}
      ]
    });

    await orders.changeDay(storage, NatashaCaller, today, POS,
                           {items : [ {goodID : panforteID, ordered : 5} ]});

    assert.containSubset(await orders.getDay(storage, NatashaCaller, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 0},
        {goodID : panforteID, goodName : "Панфорте", ordered : 5}
      ]
    });

    await orders.changeDay(
        storage, NatashaCaller, today, POS,
        {items : [ {goodID : panforteID, ordered : 2}, {goodID : sharlotteID, ordered : 1} ]});

    assert.containSubset(await orders.getDay(storage, NatashaCaller, today, POS), {
      items : [
        {goodID : sharlotteID, goodName : "Шарлотка", ordered : 1},
        {goodID : panforteID, goodName : "Панфорте", ordered : 2}
      ]
    });

    // todo: add test for this.
    // console.log('dump',
    //             util.inspect(await orders.getDay(storage, NatashaCaller, today, POS), false, null));
  });

  it("should apply operations only to specified POS", async () => {
    const storage = new InMemoryStorage();
    const POS1 = EIDFac.makePOSID();
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Липи"});
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1, POS2 ]));

    const today = Day.today();

    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.not_opened);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS2)).status,
                 DayStatus.not_opened);

    // Shop manager opens a day for pos1.
    await orders.openDay(storage, shopManagerCaller, today, POS1);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.openned);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS2)).status,
                 DayStatus.not_opened);

    // Shop manager opens a day for pos2 and it shoudl become openend
    await orders.openDay(storage, shopManagerCaller, today, POS2);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.openned);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS2)).status,
                 DayStatus.openned);

    // todo: the same test can exist for different days of one pos.
  });

  it("should check access to APIs", async () => {
    const storage = new InMemoryStorage();

    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Липи"});

    const POS3 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS3, {posID : POS3, posIDName : "Левицького"});

    // Users/Callers
    const natashaTheUser = new Caller(EIDFac.makeUserID(),
                                      new UserPermissions(PermissionFlags.IsShopManager, [ POS2 ]));
    const nastiaTheUser = new Caller(EIDFac.makeUserID(),
                                     new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
    const adminUser =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    // Goods
    const sharlotteID = EIDFac.makeGoodID();
    await storage.insertGood(
        sharlotteID,
        {id : sharlotteID, name : "Шарлотка", available : true, removed : false, units : "шт"});
    const panforteID = EIDFac.makeGoodID();
    await storage.insertGood(
        panforteID,
        {id : panforteID, name : "Панфорте", available : true, removed : false, units : "шт"});

    const today = Day.fromDate(new Date());

    // Natasha has access to POS2
    await orders.openDay(storage, natashaTheUser, today, POS2);

    // Nastia does not have access POS3
    await expect(orders.openDay(storage, nastiaTheUser, today, POS3))
        .to.be.rejectedWith(NotAllowedError);

    // Natasha can make changes for POS2
    await orders.changeDay(storage, natashaTheUser, today, POS2,
                           {items : [ {goodID : panforteID, ordered : 5} ]});

    // Nastia can't make changes for POS2
    await expect(orders.changeDay(storage, nastiaTheUser, today, POS2, {
      items : [ {goodID : panforteID, ordered : 5} ]
    })).to.be.rejectedWith(NotAllowedError);

    // Admins allowed to change anything
    await orders.openDay(storage, adminUser, today, POS3);
    await orders.changeDay(storage, adminUser, today, POS2,
                           {items : [ {goodID : panforteID, ordered : 5} ]});
  });

  it("handles day lifetime properly", async () => {
    const storage = new InMemoryStorage();

    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const natashaTheUser = new Caller(EIDFac.makeUserID(),
                                      new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));

    const today = Day.fromDate(new Date());

    // By default days are not openned
    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS1),
                         {status : DayStatus.not_opened});

    await orders.openDay(storage, natashaTheUser, today, POS1);

    // After all orders have been collected, day is closed for free changes.
    // This usally means that production is started.

    // Natasha as a shop manager cannot close day.
    await expect(orders.closeDay(storage, natashaTheUser, today, POS1))
        .to.be.rejectedWith(NotAllowedError);

    // User with IsProductionStuff permission can close a day if he has access to this resource.
    const bohdanTheUser =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, [ POS1 ]));

    await orders.closeDay(storage, bohdanTheUser, today, POS1);
    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS1),
                         {status : DayStatus.closed});

    // // Natasha (todo: or admin) can finalize a day (is done upon receiving goods).
    await orders.finalizeDay(storage, natashaTheUser, today, POS1);
    assert.containSubset(await orders.getDay(storage, natashaTheUser, today, POS1),
                         {status : DayStatus.finalized});
  });

  it("only opened days can be closed", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const caller = new Caller(EIDFac.makeUserID(),
                              new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // What is already closed can't be closed.
    await orders.openDay(storage, caller, today, POS1);
    await orders.closeDay(storage, staffCaller, today, POS1);
    await expect(orders.closeDay(storage, staffCaller, today, POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Days that have never been opened (not created at all) can't be closed.
    await expect(orders.closeDay(storage, staffCaller, new Day(Day.today().val + 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.closeDay(storage, staffCaller, new Day(Day.today().val - 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Finalized can't be closed
    const dayAftertomorrow = new Day(Day.today().val + 2);
    await orders.openDay(storage, caller, dayAftertomorrow, POS1);
    await orders.closeDay(storage, staffCaller, dayAftertomorrow, POS1);
    await orders.finalizeDay(storage, caller, dayAftertomorrow, POS1);
    await expect(orders.closeDay(storage, staffCaller, dayAftertomorrow, POS1))
        .to.be.rejectedWith(InvalidOperationError);
  });

  it("only closed days can be fianlized", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const prodStaffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));

    // Days that have never been opened (not created at all) can't be finalized
    await expect(orders.finalizeDay(storage, shopManagerCaller, new Day(Day.today().val + 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.finalizeDay(storage, shopManagerCaller, new Day(Day.today().val - 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Open cannot be finalized
    await orders.openDay(storage, shopManagerCaller, Day.today(), POS1);
    await expect(orders.finalizeDay(storage, shopManagerCaller, Day.today(), POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Finalized cannot be finalized (is not critical and can be changed to allow it).
    await orders.closeDay(storage, prodStaffCaller, Day.today(), POS1);
    await orders.finalizeDay(storage, shopManagerCaller, Day.today(), POS1);
    await expect(orders.finalizeDay(storage, shopManagerCaller, Day.today(), POS1))
        .to.be.rejectedWith(InvalidOperationError);
  });

  it("day can be opened only by shop manager or admin", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Чупринки2"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1, POS2 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // Staff member cannot open day
    await expect(orders.openDay(storage, staffCaller, today, POS1))
        .to.be.rejectedWith(NotAllowedError);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.not_opened);

    // Shop manager can open day.
    await orders.openDay(storage, shopManagerCaller, today, POS1);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.openned);

    // Admin can open day.
    await orders.openDay(storage, adminCaller, today, POS2);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.openned);
  });

  it("day can be closed only by stuff or admin", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Чупринки2"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1, POS2 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // Assuming we have some opened day
    await orders.openDay(storage, shopManagerCaller, today, POS1);

    // Shop manager can't close the day.
    await expect(orders.closeDay(storage, shopManagerCaller, today, POS1))
        .to.be.rejectedWith(NotAllowedError);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.openned);

    // Admin users can close the day.
    await orders.closeDay(storage, adminCaller, today, POS1);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.closed);

    // The same expectations for Staff member
    // Assuming we have some opened day
    await orders.openDay(storage, shopManagerCaller, today, POS2);
    await orders.closeDay(storage, staffCaller, today, POS2);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS2)).status,
                 DayStatus.closed);
  });

  it("day can be finalized only by shop manager or admin", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Чупринки2"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1, POS2 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // Assuming we have some closed day
    await orders.openDay(storage, shopManagerCaller, today, POS1);
    await orders.closeDay(storage, staffCaller, today, POS1);

    // ProdStaff user can't finalize the day.
    await expect(orders.finalizeDay(storage, staffCaller, today, POS1))
        .to.be.rejectedWith(NotAllowedError);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.closed);

    // Can be finalized by shop manager
    await orders.finalizeDay(storage, shopManagerCaller, today, POS1);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS1)).status,
                 DayStatus.finalized);

    // The same expectations for admin.
    await orders.openDay(storage, shopManagerCaller, today, POS2);
    await orders.closeDay(storage, staffCaller, today, POS2);
    await orders.finalizeDay(storage, adminCaller, today, POS2);
    assert.equal((await orders.getDay(storage, shopManagerCaller, today, POS2)).status,
                 DayStatus.finalized);
  });

  it("change day allowed for shop managers for their POS or admins/staff", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = await pos.createPOS(storage, "Чупринки");

    const globalAdminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const shopManagerUser = await users.createUser(
        storage, globalAdminCaller, "ShopMan",
        new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]), "Shop Manager", "911");

    const staffUser = await users.createUser(storage, globalAdminCaller, "ProdStaff",
                                             new UserPermissions(PermissionFlags.IsProdStaff, []),
                                             "Prod Stuff", "911");
    const adminUser = await users.createUser(storage, globalAdminCaller, "BakeryAdmin",
                                             new UserPermissions(PermissionFlags.Admin, []),
                                             "Bakery Administrator", "911");

    const asCaller = async (storage: AbstractStorage, userID: EID) => {
      const user = await users.getUser(storage, globalAdminCaller, userID);
      return new Caller(userID, user.permissions);
    };

    const shopManagerCaller = await asCaller(storage, shopManagerUser);
    const adminCaller = await asCaller(storage, adminUser);
    const staffCaller = await asCaller(storage, staffUser);
    const otherCaller =
        new Caller(EIDFac.makeUserID(),
                   new UserPermissions(~(PermissionFlags.IsShopManager |
                                         PermissionFlags.IsProdStaff | PermissionFlags.Admin),
                                       []));

    const today = Day.today();

    const good1ID = await createGood(storage, adminCaller, "Шарлотка по Франківськи", "шт");
    const good2ID = await createGood(storage, adminCaller, "Булочка", "шт");

    await orders.openDay(storage, shopManagerCaller, today, POS1);

    // Shop manager can change day
    await orders.changeDay(storage, shopManagerCaller, today, POS1,
                           {items : [ {goodID : good1ID, ordered : 10} ]});
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {items : [ {goodID : good1ID, ordered : 10} ]});

    // Stuff member can change day.
    await orders.changeDay(storage, staffCaller, today, POS1,
                           {items : [ {goodID : good1ID, ordered : 5} ]});
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {items : [ {goodID : good1ID, ordered : 5} ]});

    // Admin member can change day.
    await orders.changeDay(storage, adminCaller, today, POS1,
                           {items : [ {goodID : good1ID, ordered : 5} ]});
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {items : [ {goodID : good1ID, ordered : 5} ]});
    // Someone else is not allowed to change day.
    await expect(orders.changeDay(storage, otherCaller, today, POS1, {
      items : [ {goodID : good1ID, ordered : 15} ]
    })).to.be.rejectedWith(NotAllowedError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {items : [ {goodID : good1ID, ordered : 5} ]});
  });

  it("should allow changing only opened day or closed day", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const shopManagerCaller = await createUserAsCallerWithPermissions(
        storage, new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.today();

    const good1ID = await createGood(storage, adminCaller, "Шарлотка по Франківськи", "шт");
    const good2ID = await createGood(storage, adminCaller, "Булочка", "шт");

    // Changing not opened day is invalid
    await expect(orders.changeDay(storage, shopManagerCaller, today, POS1, {
      items : [ {goodID : good1ID, ordered : 10} ]
    })).to.be.rejectedWith(InvalidOperationError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.not_opened});

    await orders.openDay(storage, shopManagerCaller, today, POS1);
    // Chaning opened day is allowed
    await orders.changeDay(storage, shopManagerCaller, today, POS1,
                           {items : [ {goodID : good1ID, ordered : 10} ]});
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.openned});

    await orders.closeDay(storage, staffCaller, today, POS1);

    // Changing closed is handled a bit differently but for this test we just check it is allowed.
    await orders.changeDay(storage, shopManagerCaller, today, POS1,
                           {items : [ {goodID : good1ID, ordered : 20} ]});
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.closed, items : [ {goodID : good1ID, ordered : 20} ]});

    await orders.finalizeDay(storage, shopManagerCaller, today, POS1);

    // Changing finalized day is not allowed
    await expect(orders.changeDay(storage, shopManagerCaller, today, POS1, {
      items : [ {goodID : good1ID, ordered : 30} ]
    })).to.be.rejectedWith(InvalidOperationError);
    assert.containSubset(
        await orders.getDay(storage, adminCaller, today, POS1),
        {status : DayStatus.finalized, items : [ {goodID : good1ID, ordered : 20} ]});
  });

  it("opening past days or days from too far future not alowed", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));

    const today = Day.today();
    const yesterday = new Day(today.val - 1);
    const tooFarFuture = new Day(today.val + 32);
    const maximumFuture = new Day(today.val + 31);

    await orders.openDay(storage, shopManagerCaller, today, POS1);
    await orders.openDay(storage, shopManagerCaller, maximumFuture, POS1);

    await expect(orders.openDay(storage, shopManagerCaller, yesterday, POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.openDay(storage, shopManagerCaller, tooFarFuture, POS1))
        .to.be.rejectedWith(InvalidOperationError);
  });

  it("opening day that is already opened is invalid operation", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));

    const today = Day.today();
    const futureDoday = new Day(today.val + 1);

    await orders.openDay(storage, shopManagerCaller, today, POS1);
    await orders.openDay(storage, shopManagerCaller, futureDoday, POS1);

    await expect(orders.openDay(storage, shopManagerCaller, today, POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.openDay(storage, shopManagerCaller, futureDoday, POS1))
        .to.be.rejectedWith(InvalidOperationError);
  });

  it("should not allow doing operations on unexisting POS", async () => {
    // test
    const storage = new InMemoryStorage();

    // Users/Callers
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    // todo: these tests can be improved to not relly on fact that POS checks
    // are done before anything else.
    await expect(orders.openDay(storage, adminCaller, Day.today(), EIDFac.makePOSID()))
        .to.be.rejectedWith(NotFoundError, "POS");
    await expect(orders.closeDay(storage, adminCaller, Day.today(), EIDFac.makePOSID()))
        .to.be.rejectedWith(NotFoundError, "POS");
    await expect(orders.finalizeDay(storage, adminCaller, Day.today(), EIDFac.makePOSID()))
        .to.be.rejectedWith(NotFoundError, "POS");
  });

  it("should not allow change item with unexsiting good", async () => {
    const storage = new InMemoryStorage();
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));

    const good1ID = await createGood(storage, adminCaller, "Шарлотка по Франківськи", "шт");
    const good2ID = await createGood(storage, adminCaller, "Булочка", "шт");

    await orders.openDay(storage, shopManagerCaller, Day.today(), POS1);
    await expect(orders.changeDay(storage, shopManagerCaller, Day.today(), POS1, {
      items : [ {goodID : EIDFac.makeGoodID(), ordered : 10} ]
    })).to.be.rejectedWith(InvalidOperationError, "not available in order");
  });

  it("changing days tests", async () => {
    // todo: add more fine grained tests.
    const storage = new InMemoryStorage();
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const shopManagerPermissions = new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]);
    const shopManagerCaller =
        new Caller(await users.createUser(storage, adminCaller, "Наташа", shopManagerPermissions,
                                          "Наталія Менеджерівна", "+380978763443"),
                   shopManagerPermissions);

    const bakeryAdminCaller =
        new Caller(await users.createUser(storage, adminCaller, "ГалинаС",
                                          new UserPermissions(PermissionFlags.Admin, []),
                                          "Галина Степанівна", "+380978763441"),
                   new UserPermissions(PermissionFlags.Admin, []));

    const good1ID = await createGood(storage, adminCaller, "Шарлотка по Франківськи", "шт");
    const good2ID = await createGood(storage, adminCaller, "Булочка", "шт");

    await orders.openDay(storage, shopManagerCaller, Day.today(), POS1);

    await orders.changeDay(storage, shopManagerCaller, Day.today(), POS1,
                           {items : [ {goodID : good1ID, ordered : 10} ]});

    assert.containSubset(await orders.getDay(storage, shopManagerCaller, Day.today(), POS1), {
      status : DayStatus.openned,
      items : [ {
        goodID : good1ID,
        goodName : "Шарлотка по Франківськи",
        units : "шт",
        ordered : 10,
        status : 'Default',
        history : [ {count : 10, diff : 10, userID : shopManagerCaller.ID, userName : "Наташа"} ]
      } ]
    });

    // Second edit (by bakery admin, who decided to make adjustments).
    await orders.changeDay(
        storage, bakeryAdminCaller, Day.today(), POS1,
        {items : [ {goodID : good1ID, ordered : 5}, {goodID : good2ID, ordered : 7} ]});

    assert.containSubset(await orders.getDay(storage, shopManagerCaller, Day.today(), POS1), {
      status : DayStatus.openned,
      items : [
        {
          goodID : good1ID,
          goodName : "Шарлотка по Франківськи",
          units : "шт",
          ordered : 5,
          status : 'Default',
          history : [
            {count : 10, diff : 10, userID : shopManagerCaller.ID, userName : "Наташа"},
            {count : 5, diff : -5, userID : bakeryAdminCaller.ID, userName : "ГалинаС"}
          ]
        },
        {
          goodID : good2ID,
          goodName : "Булочка",
          units : "шт",
          ordered : 7,
          status : 'Default',
          history : [ {count : 7, diff : +7, userID : bakeryAdminCaller.ID, userName : "ГалинаС"} ]
        }
      ]
    });

    // Edit after close.
    await orders.closeDay(storage, adminCaller, Day.today(), POS1);

    await orders.changeDay(
        storage, shopManagerCaller, Day.today(), POS1,
        {items : [ {goodID : good1ID, ordered : 30}, {goodID : good2ID, ordered : 0} ]});

    assert.containSubset(await orders.getDay(storage, shopManagerCaller, Day.today(), POS1), {
      status : DayStatus.closed,
      items : [
        {
          goodID : good1ID,
          goodName : "Шарлотка по Франківськи",
          units : "шт",
          ordered : 30,
          status : 'RequestedEditAfterClose',
          history : [
            {count : 10, diff : 10, userID : shopManagerCaller.ID, userName : "Наташа"},
            {count : 5, diff : -5, userID : bakeryAdminCaller.ID, userName : "ГалинаС"},
            {count : 30, diff : +25, userID : shopManagerCaller.ID, userName : "Наташа"}
          ]
        },
        {
          goodID : good2ID,
          goodName : "Булочка",
          units : "шт",
          ordered : 0,
          status : 'RequestedEditAfterClose',
          history : [
            {count : 7, diff : +7, userID : bakeryAdminCaller.ID, userName : "ГалинаС"},
            {count : 0, diff : -7, userID : shopManagerCaller.ID, userName : "Наташа"}
          ]
        }
      ]
    });
  });

  // TODO: good coverege of function changes for changing items, detecting conflicts,
  // concurrency issues, audit, notifications.

  it("playground for doc events", async () => {
    const good1 = EIDFac.makeGoodID();
    const good2 = EIDFac.makeGoodID();

    const POS1 = EIDFac.makePOSID();

    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));

    const day = DayAggregate.create(POS1, adminCaller, Day.today(), [ good1, good2 ]);
    day.editDay(adminCaller, [ {good : good1, amount : 3} ]);
    day.editDay(adminCaller, [ {good : good1, amount : 12}, {good : good2, amount : 50} ]);
    day.editDay(adminCaller, [ {good : good1, amount : 8} ]);
    day.closeDay(adminCaller);
    day.finalizeDay(adminCaller);

    const storage = new InMemoryStorage();
    await orders.saveDayAggregate(storage, day);

    const loadedDay = await orders.loadDayAggregate(storage, Day.today(), POS1);

    //console.log("\nloadedDay", util.inspect(loadedDay.items, false, null));
  });
});
