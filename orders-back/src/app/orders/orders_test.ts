import { assert } from "chai";
import { InMemoryStorage } from "storage/InMemStorage";
import { EntityID } from "types/core_types";
import * as orders from "./orders";

describe("orders", () => {
  it("detects invalid dates passed to getOrdersForDateRange", async () => {
    const storage = new InMemoryStorage();
    try {
      await orders.getOrdersForDate(storage, new Date("some garbage"));
      assert.fail("This should not be called");
    } catch (err) {}
  });

  it("should support basic scenario", async () => {
    const storage = new InMemoryStorage();
    const product1 = new EntityID("PRO");
    storage.insertProduct(product1, {
      id: product1,
      productName: "Круасан з Моколадом",
    });

    const product2 = new EntityID("PRO");
    storage.insertProduct(product2, {
      id: product2,
      productName: "Шарлотка по Франківськи",
    });

    // Create some user User1.
    const user1ID = new EntityID("USR");
    storage.insertUser(user1ID, {
      userIdName: "nat",
      userFullName: "Наталія Панфорте",
    });

    // Create some POS where user nat works.
    const pos1ID = new EntityID("POS");
    storage.insertPointOfSale(pos1ID, {
      posIDName: "ЮЛипи",
    });

    // Create another User2.
    const user2ID = new EntityID("USR");
    storage.insertUser(user2ID, {
      userIdName: "nat",
      userFullName: "Зоя Маріуполь",
    });

    // Create another POS where zoya works.
    const pos2ID = new EntityID("POS");
    storage.insertPointOfSale(pos2ID, {
      posIDName: "Чупринки",
    });

    // User1 places its order for some day.
    const order1ID = await orders.placeOrder(storage, {
      whoPlaced: user1ID,
      toDate: new Date("2020-05-28"),
      posID: pos1ID,
      items: [
        {
          id: product1,
          count: 10,
        },
        {
          id: product2,
          count: 100,
        },
      ],
    });

    // User1 places its order for some day.
    const order2ID = await orders.placeOrder(storage, {
      whoPlaced: user1ID,
      toDate: new Date("2020-05-28"),
      posID: pos2ID,
      items: [
        {
          id: product1,
          count: 50,
        },
      ],
    });


    // getOrdersForDate returns orders for the specifid date.
    assert.deepEqual(await orders.getOrdersForDate(storage, new Date("2020-05-28")), {
      toDate: new Date("2020-05-28"),
      items: [
        {
          productName: "Круасан з Моколадом",
          productID: product1,
          count: 60,
          details: [
            { count: 10, posID: pos1ID, posIDName: "ЮЛипи" },
            { count: 50, posID: pos2ID, posIDName: "Чупринки" },
          ],
        },
        {
          productName: "Шарлотка по Франківськи",
          productID: product2,
          count: 100,
          details: [{ count: 100, posID: pos1ID, posIDName: "ЮЛипи" }],
        },
      ],
    });

    // json example
    // console.log(JSON.stringify(await orders.getOrdersForDate(storage, new Date("2020-05-28"))));
  });

});
