import {assert, expect} from "chai";
import {InMemoryStorage} from "storage/InMemStorage";
import {Caller} from "types/Caller";
import {Day, EID, EIDFac} from "types/core_types";
import {DayStatus, POSModel} from "types/domain_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

import {InvalidOperationError, NotAllowedError, NotFoundError} from "./errors";
import {createGood} from "./goods";
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

    const natashaTheUser = new Caller(EIDFac.makeUserID(),
                                      new UserPermissions(PermissionFlags.IsShopManager, [ POS ]));

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
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Липи"});

    const natashaTheUser = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1, POS2 ]));

    const today = Day.fromDate(new Date());

    // Natasha opens a day for pos1.
    await orders.openDay(storage, natashaTheUser, today, POS1);

    // Day for POS1 is opened, but for POS2 is not.
    await orders.getDay(storage, natashaTheUser, today, POS1);

    // Natasha opens a day for pos2.
    await orders.openDay(storage, natashaTheUser, today, POS2);

    // Now pos2 day is opened.
    await orders.getDay(storage, natashaTheUser, today, POS2);
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

    // Nastia does not have access POS2
    await expect(orders.openDay(storage, nastiaTheUser, today, POS2))
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

    // Natasha (todo: or admin) can finalize a day (is done upon receiving goods).
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
    const caller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, [ POS1 ]));

    const today = Day.fromDate(new Date());

    await orders.openDay(storage, caller, today, POS1);

    assert.containSubset(await storage.getOrderForDay(today, POS1), {status : DayStatus.openned});

    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    await orders.closeDay(storage, staffCaller, today, POS1);

    // What is already closed can't be closed.
    await expect(orders.closeDay(storage, staffCaller, today, POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Days that have never been opened (not created at all) can't be closed.
    await expect(orders.closeDay(storage, staffCaller, new Day(Day.today().val + 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.closeDay(storage, staffCaller, new Day(Day.today().val - 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Finalized can't be closed
    await storage.updateOrderForDay(
        today, POS1, (day) => {return { items: day.items, status: DayStatus.finalized }});
    await expect(orders.closeDay(storage, staffCaller, today, POS1))
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

    const today = Day.fromDate(new Date());

    await storage.insertOrderForDay(today, POS1, {status : DayStatus.not_opened, items : []});

    // Days that have never been opened (not created at all) can't be finalized
    await expect(orders.finalizeDay(storage, shopManagerCaller, new Day(Day.today().val + 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);
    await expect(orders.finalizeDay(storage, shopManagerCaller, new Day(Day.today().val - 1), POS1))
        .to.be.rejectedWith(InvalidOperationError);

    // Cannot close not_opened
    await expect(orders.closeDay(storage, prodStaffCaller, today, POS1))
        .to.be.rejectedWith(InvalidOperationError);
    assert.equal((await orders.getDay(storage, prodStaffCaller, today, POS1)).status,
                 DayStatus.not_opened);

    // Openned can be closed
    await storage.updateOrderForDay(
        today, POS1, (day) => {return { items: day.items, status: DayStatus.openned }});
    await orders.closeDay(storage, prodStaffCaller, today, POS1);
    assert.equal((await orders.getDay(storage, prodStaffCaller, today, POS1)).status,
                 DayStatus.closed);

    // Finalized can't be closed
    await storage.updateOrderForDay(
        today, POS1, (day) => {return { items: day.items, status: DayStatus.finalized }});
    await expect(orders.closeDay(storage, prodStaffCaller, today, POS1))
        .to.be.rejectedWith(InvalidOperationError);
    assert.equal((await orders.getDay(storage, prodStaffCaller, today, POS1)).status,
                 DayStatus.finalized);
  });

  it("day can be closed only by stuff or admin", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Чупринки2"});

    // Users/Callers
    const shopManagerCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.ReadWrite, [ POS1 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // Assuming we have some opened day
    await storage.insertOrderForDay(today, POS1, {status : DayStatus.openned, items : []});

    // Regular user can't close the day.
    await expect(orders.closeDay(storage, shopManagerCaller, today, POS1))
        .to.be.rejectedWith(NotAllowedError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.openned});

    // Admin users can close the day.
    await orders.closeDay(storage, adminCaller, today, POS1);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.closed});

    // make it openned back
    storage.updateOrderForDay(today, POS1,
                              (day) => {return { items: day.items, status: DayStatus.openned }});

    // PRoduction Staff can close the day (even without explict access to POS1 in resources[])
    await orders.closeDay(storage, adminCaller, today, POS1);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.closed});
  });

  it("day can be fianlized only by shop manager or admin", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});
    const POS2 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS2, {posID : POS2, posIDName : "Чупринки2"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));

    const today = Day.fromDate(new Date());

    // Assuming we have some closed day
    await storage.insertOrderForDay(today, POS1, {status : DayStatus.closed, items : []});
    await storage.insertOrderForDay(today, POS2, {status : DayStatus.closed, items : []});

    // ProdStaff user can't finalize the day.
    await expect(orders.finalizeDay(storage, staffCaller, today, POS1))
        .to.be.rejectedWith(NotAllowedError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.closed});

    // Can be finalized by shop manager
    await orders.finalizeDay(storage, shopManagerCaller, today, POS1);
    assert.containSubset(await orders.getDay(storage, shopManagerCaller, today, POS1),
                         {status : DayStatus.finalized});

    // make it closed back
    storage.updateOrderForDay(today, POS1,
                              (day) => {return { items: day.items, status: DayStatus.closed }});

    // Can be finalized by admin
    await orders.finalizeDay(storage, shopManagerCaller, today, POS1);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.finalized});

    // Cannot finalize POS2
    await expect(orders.finalizeDay(storage, shopManagerCaller, today, POS2))
        .to.be.rejectedWith(NotAllowedError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS2),
                         {status : DayStatus.closed});
  });

  it("change day allowed for shop managers for their POS or admins/staff", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = await pos.createPOS(storage, "Чупринки");

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
    const adminCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.Admin, []));
    const staffCaller =
        new Caller(EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsProdStaff, []));
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

  it("should allow changing only opened day", async () => {
    const storage = new InMemoryStorage();
    // POSs
    const POS1 = EIDFac.makePOSID();
    await storage.insertPointOfSale(POS1, {posID : POS1, posIDName : "Чупринки"});

    // Users/Callers
    const shopManagerCaller = new Caller(
        EIDFac.makeUserID(), new UserPermissions(PermissionFlags.IsShopManager, [ POS1 ]));
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

    // Changing closed is not allowed (yet)
    await expect(orders.changeDay(storage, shopManagerCaller, today, POS1, {
      items : [ {goodID : good1ID, ordered : 20} ]
    })).to.be.rejectedWith(InvalidOperationError);
    assert.containSubset(await orders.getDay(storage, adminCaller, today, POS1),
                         {status : DayStatus.closed, items : [ {goodID : good1ID, ordered : 10} ]});

    await orders.finalizeDay(storage, shopManagerCaller, today, POS1);

    // Changing finalized day is not allowed
    await expect(orders.changeDay(storage, shopManagerCaller, today, POS1, {
      items : [ {goodID : good1ID, ordered : 20} ]
    })).to.be.rejectedWith(InvalidOperationError);
    assert.containSubset(
        await orders.getDay(storage, adminCaller, today, POS1),
        {status : DayStatus.finalized, items : [ {goodID : good1ID, ordered : 10} ]});
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

  // TODO: good coverege of function changes for changing items, detecting conflicts,
  // concurrency issues, audit, notifications.
});
