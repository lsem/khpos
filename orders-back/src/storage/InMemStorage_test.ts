import {assert, expect} from "chai";
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import chaiSubset from 'chai-subset';
import {InMemoryStorage} from "storage/InMemStorage";
import {EntityID} from "types/core_types";
import {UserModel} from "types/domain_types";
import {PermissionFlags, UserPermissions} from "types/UserPermissions";

chai.use(chaiAsPromised);
chai.use(chaiSubset);

const AnyUserPermissions = new UserPermissions(PermissionFlags.None, []);

describe("[inmem.users]", () => {
  it("should allow to get preiosly stored user by same ID value ", async () => {
    const storage = new InMemoryStorage();
    const id = EntityID.makeUserID();
    await storage.insertUser(id, {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : AnyUserPermissions
    });

    // lets pretedend we get this id somewhere from client
    const sameIdFromClient = EntityID.fromExisting(id.value);
    assert.deepEqual(await storage.getUser(sameIdFromClient), {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : AnyUserPermissions
    });
  });

  it("should update user coorectly", async () => {
    const storage = new InMemoryStorage();
    const id = EntityID.makeUserID();
    const initial = new UserPermissions(PermissionFlags.None, []);
    await storage.insertUser(id, {
      userID : id,
      userIdName : 'sem',
      userFullName : 'Semen',
      telNumber : '',
      permissions : initial
    });

    const resource = EntityID.makePOSID();
    const newPermissions = new UserPermissions(PermissionFlags.Write, [ resource ]);
    await storage.updateUser(id, (user: UserModel) => { user.permissions = newPermissions; })

    assert.containSubset(await storage.getUser(id),
                         {permissions : {mask : PermissionFlags.Write, resources : [ resource ]}});

    // Verify that there is no unexpected spec-effects with references
    newPermissions.resources.push(EntityID.makePOSID());
    assert.containSubset(await storage.getUser(id),
                         {permissions : {mask : PermissionFlags.Write, resources : [ resource ]}});
  });
});

describe("[inmem.pos]",
         () => {it("should allow to get preiosly stored pos by same ID value ", async () => {
           const storage = new InMemoryStorage();
           const id = EntityID.makePOSID();
           await storage.insertPointOfSale(id, {posID : id, posIDName : 'central'});

           // lets pretedend we get this id somewhere from client
           const sameIdFromClient = EntityID.fromExisting(id.value);
           assert.deepEqual(await storage.getPointOfSale(sameIdFromClient),
                            {posID : id, posIDName : 'central'});
         })});

describe("[inmem.products]",
         () => {it("should allow to get previously stored product by same ID value ", async () => {
           const storage = new InMemoryStorage();
           const id = EntityID.makeProductID();
           await storage.insertProduct(id, {id : id, productName : 'water'});

           // lets pretedend we get this id somewhere from client
           const sameIdFromClient = EntityID.fromExisting(id.value);
           assert.deepEqual(await storage.getProductByID(sameIdFromClient),
                            {id : id, productName : 'water'});
         })});

describe(
    "[inmem.orders]",
    () => {it.skip("should allow to get previously stored order by same ID value ", async () => {
      const posID = EntityID.makePOSID();
      const userID = EntityID.makeUserID();
      const storage = new InMemoryStorage();
      const id = EntityID.makeOrderID();
      await storage.insertOrder(
          id, {posID : posID, toDate : new Date("2020-05-05"), whoPlaced : userID, items : []});

      // lets pretedend we get this id somewhere from client
      const sameIdFromClient = EntityID.fromExisting(id.value);
      // todo: not enough methods for veryfying this yet.
    })});
