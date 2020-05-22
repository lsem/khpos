const KhPosApplication = require("../../src/KhPosApplication");
const InMemStorage = require("../../src/InMemStorage");
const chai = require("chai");
const assert = require("chai").assert;
const uuid = require("uuid");
const chaiSubset = require("chai-subset");

chai.use(chaiSubset);

class FakePosterProxy {}

describe("Application.POS", () => {
  // todo: add test that I can create valid POS, cannot create invalid POS, list all available POS's
});

describe("Application.Orders", () => {
  it("Should support main scenario of working with orders", async () => {
    const storage = new InMemStorage();
    const application = new KhPosApplication({
      storage: storage,
      posterProxy: new FakePosterProxy(),
    });

    // Given two POSs and two users.
    const pos1ID = `POS-` + uuid.v4();
    await application.createPOS({ idName: "Чупринки", id: pos1ID });
    const pos2ID = `POS-` + uuid.v4();
    await application.createPOS({ idName: "Юрія Липи", id: pos2ID });
    const user1ID = `USR-` + uuid.v4();
    const user2ID = `USR-` + uuid.v4();

    await application.createUser({ id: user1ID, name: "Наталія Шарлотка" });
    await application.createUser({ id: user2ID, name: "Настя Панфорте" });

    const product1ID = `PRO-` + uuid.v4();
    const product2ID = `PRO-` + uuid.v4();

    // POS 1 palces its order.
    await application.placeOrder(user1ID, {
      dateCreated: "1970-01-01T01:57:03.456Z",
      dateOrderFor: "2020-05-28",
      placedByUID: user1ID,
      customerPOSID: pos1ID,
      items: [{ productID: product1ID, count: 10 }],
    });

    // POS 2 palces its order.
    await application.placeOrder(user2ID, {
      dateCreated: "1970-01-01T01:57:03.456Z",
      dateOrderFor: "2020-05-28",
      placedByUID: user2ID,
      customerPOSID: pos2ID,
      items: [
        { productID: product1ID, count: 30 },
        { productID: product2ID, count: 40 },
      ],
    });

    // User from POS1 now wants to see its order for 2020-05-28.
    assert.deepEqual(
      await application.getOrderForDayAndPos(user1ID, new Date("2020-05-28"), pos1ID),
      [
        {
          dateCreated: new Date("1970-01-01T01:57:03.456Z"),
          dateOrderFor: new Date("2020-05-28"),
          placedByUID: user1ID,
          customerPOSID: pos1ID,
          items: [{ productID: product1ID, count: 10 }],
        },
      ]
    );
    // User does not see anything for day before for POS1.
    assert.deepEqual(
      await application.getOrderForDayAndPos(user1ID, new Date("2020-05-27"), pos1ID),
      []
    );
    // User does not see anything for day after for POS1.
    assert.deepEqual(
      await application.getOrderForDayAndPos(user1ID, new Date("2020-05-29"), pos1ID),
      []
    );

    // User1 can see POS2 orders, and POS2 can see POS1 orders.
    assert.deepEqual(
      await application.getOrderForDayAndPos(user1ID, new Date("2020-05-28"), pos2ID),
      [
        {
          dateCreated: new Date("1970-01-01T01:57:03.456Z"),
          dateOrderFor: new Date("2020-05-28T00:00:00.000Z"),
          placedByUID: user2ID,
          customerPOSID: pos2ID,
          items: [
            { productID: product1ID, count: 30 },
            { productID: product2ID, count: 40 },
          ],
        },
      ]
    );

    // Lets aggregated.
    assert.deepEqual(
      await application.getAggregatedOrders(user1ID, new Date("2020-05-28")),
      [
        {
          dateCreated: new Date("1970-01-01T01:57:03.456Z"),
          dateOrderFor: new Date("2020-05-28T00:00:00.000Z"),
          placedByUID: user2ID,
          customerPOSID: pos2ID,
          items: [
            { productID: product1ID, count: 40 },
            { productID: product2ID, count: 40 },
          ],
        },
      ]

      );
    })

  // Missing tests:
  //      - Should not accept orders for past days.
  //      - Should check access rights.
  //      - Should return aggregated orders for POS.
  //      - Should return aggregated orders for all POS for Shop processing.
  //      - Should be possible to create orders with different product types (and system should be able to differentiate this)
  //      - Should accept number of items in some range (to protect from logic errors and API misuse).

  //assert.containSubset(orders, [{
});
