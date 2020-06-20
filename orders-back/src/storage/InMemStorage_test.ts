import {NotFoundError} from "app/errors";
import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import chaiSubset from 'chai-subset';
import {InMemoryStorage} from "storage/InMemStorage";
import {EID, EIDFac} from "types/core_types";
import {GoodModel, UserModel} from "types/domain_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

chai.use(chaiAsPromised);
chai.use(chaiSubset);

const AnyUserPermissions = new UserPermissions(PermissionFlags.None, []);

describe("[inmem.users]", () => {
  it("should allow to get preiosly stored user by same ID value ", async () => {
    const storage = new InMemoryStorage();
    const id = EIDFac.makeUserID();
    await storage.insertUser(id, {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : AnyUserPermissions,
      isActive : true,
      passwordHash : 'somehash'
    });

    // lets pretedend we get this id somewhere from client
    const sameIdFromClient = EIDFac.fromExisting(id);
    assert.deepEqual(await storage.getUser(sameIdFromClient), {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : AnyUserPermissions,
      isActive : true,
      passwordHash : 'somehash'
    });
  });

  it("should update user coorectly", async () => {
    const storage = new InMemoryStorage();
    const id = EIDFac.makeUserID();
    const initial = new UserPermissions(PermissionFlags.None, []);
    await storage.insertUser(id, {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : initial,
      isActive : true,
      passwordHash : 'somehash'
    });

    const resource = EIDFac.makePOSID();
    const newPermissions = new UserPermissions(PermissionFlags.Write, [ resource ]);
    await storage.updateUser(id, (user: UserModel) => { user.permissions = newPermissions; })

    assert.containSubset(await storage.getUser(id),
                         {permissions : {mask : PermissionFlags.Write, resources : [ resource ]}});

    // Verify that there is no unexpected spec-effects with references
    newPermissions.resources.push(EIDFac.makePOSID());
    assert.containSubset(await storage.getUser(id),
                         {permissions : {mask : PermissionFlags.Write, resources : [ resource ]}});
  });
});

describe("[inmem.pos]",
         () => {it("should allow to get preiosly stored pos by same ID value ", async () => {
           const storage = new InMemoryStorage();
           const id = EIDFac.makePOSID();
           await storage.insertPointOfSale(id, {posID : id, posIDName : 'central'});

           // lets pretedend we get this id somewhere from client
           const sameIdFromClient = EIDFac.fromExisting(id);
           assert.deepEqual(await storage.getPointOfSale(sameIdFromClient),
                            {posID : id, posIDName : 'central'});
         })});

describe("[inmem.goods]", () => {
  it("should allow to get previously stored good by same ID value ", async () => {
    const storage = new InMemoryStorage();
    const id = EIDFac.makeGoodID();
    await storage.insertGood(
        id, {id : id, name : "water", units : "it", available : true, removed : false});

    // lets pretedend we get this id somewhere from client
    const sameIdFromClient = EIDFac.fromExisting(id);
    assert.deepEqual(await storage.getGoodByID(sameIdFromClient),
                     {id : id, name : 'water', units : 'it', available : true, removed : false});
  });

  it("should raise NotFoundError if not found ", async () => {
    const storage = new InMemoryStorage();
    await expect(storage.getGoodByID(EIDFac.makeGoodID())).to.be.rejectedWith(NotFoundError);
  })

  it("should return all previosly stored goods ", async () => {
    const storage = new InMemoryStorage();
    const id1 = EIDFac.makeGoodID();
    const id2 = EIDFac.makeGoodID();
    await storage.insertGood(
        id1, {id : id1, name : "water", units : "it", available : true, removed : false});
    await storage.insertGood(
        id2, {id : id2, name : "wine", units : "it", available : true, removed : false});
    const allGoods = await storage.getAllGoods();
    assert.containSubset(allGoods, [ {id : id1, name : "water"}, {id : id2, name : "wine"} ]);
    // make sure that modifed goods does not have spec-effects with references.
    allGoods[0].name = "wine";
    assert.containSubset(await storage.getAllGoods(),
                         [ {id : id1, name : "water"}, {id : id2, name : "wine"} ]);
  });

  it("should allow updating goods", async () => {
    const storage = new InMemoryStorage();
    const id = EIDFac.makeGoodID();
    await storage.insertGood(
        id, {id : id, name : "water", units : "litres", available : true, removed : false});
    await storage.updateGood(id, (good: GoodModel) => {return { ...good, name: "wine" }});
    assert.deepEqual(await storage.getGoodByID(id),
                     {id : id, name : "wine", units : "litres", available : true, removed : false});
    await expect(storage.updateGood(id, (good: GoodModel) => {
      return { ...good, id: EIDFac.makeGoodID() }
    })).to.be.rejectedWith(Error, "Changing ID is not allowed");
  });
});

describe(
    "[inmem.orders]",
    () => {it.skip("should allow to get previously stored order by same ID value ", async () => {
      const posID = EIDFac.makePOSID();
      const userID = EIDFac.makeUserID();
      const storage = new InMemoryStorage();
      const id = EIDFac.makeOrderID();
      await storage.insertOrder(
          id, {posID : posID, toDate : new Date("2020-05-05"), whoPlaced : userID, items : []});

      // lets pretedend we get this id somewhere from client
      const sameIdFromClient = EIDFac.fromExisting(id);
      // todo: not enough methods for veryfying this yet.
    })});
