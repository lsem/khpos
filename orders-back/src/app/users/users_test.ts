import {assert} from "chai";
import {InMemoryStorage} from "storage/InMemStorage";
import * as users from "./users";

describe("[users]", () => {
  it("should pass basic test", async () => {
    const storage = new InMemoryStorage();
    const user1ID = await users.createUser(storage, "Ната", "Наталія Бушмак", "+380961112233");
    assert.deepEqual(await users.getUser(storage, user1ID), {
      userID : user1ID,
      userIdName : "Ната",
      userFullName : "Наталія Бушмак",
      telNumber : "+380961112233",
    });

    assert.deepEqual(await users.getAllUsers(storage), [ {
                       userID : user1ID,
                       userIdName : "Ната",
                       userFullName : "Наталія Бушмак",
                       telNumber : "+380961112233",
                     } ]);

    const user2ID = await users.createUser(storage, "Вас", "Василь Тістоміс", "+380961112234");
    assert.deepEqual(await users.getAllUsers(storage), [
      {
        userID : user1ID,
        userIdName : "Ната",
        userFullName : "Наталія Бушмак",
        telNumber : "+380961112233",
      },
      {
        userID : user2ID,
        userIdName : "Вас",
        userFullName : "Василь Тістоміс",
        telNumber : "+380961112234",
      }
    ]);
  });

  it("should disallow creating duplicate users", async () => {
    const storage = new InMemoryStorage();
    let firstCreated = false;
    try {
      const user1ID = await users.createUser(storage, "Ната", "Наталія Бушмак", "+380961112233");
      firstCreated = true;
      const user2ID = await users.createUser(storage, "Ната", "Наталія Бушмак", "+380961112233");
      assert.fail("Should not create second user and go to catch");
    } catch (err) {
      assert.isTrue(firstCreated);
      assert.instanceOf(err, Error);
      assert.equal(err.message, "User with such IDName already exists");
    }
  });
});

// todo: test that inserting user with same ID or with same idname is error.