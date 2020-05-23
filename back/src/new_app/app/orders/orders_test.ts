import { assert } from "chai";
import { InMemoryStorage } from "../../storage/InMemStorage";
import { EntityID } from "../../types/core_types";
import * as orders from "./orders";

describe("orders", () => {
  it("should support basic scenario", async () => {
    const storage = new InMemoryStorage();

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

    await orders.placeOrder(storage, "some new order", null);

    //
    // Expectations
    //
    await orders.getOrdersForDateRange(storage, new Date("ss"), new Date("xx"));
  });
});
