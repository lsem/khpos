import _ from 'lodash';
import * as uuid from "uuid";

// Wrapper around string.
class EntityID {
  value: string = ""; // todo: remove to value

  // This constructor kept for compatibility. to be refactored.
  constructor(tag: string|null) {
    if (tag && tag!.length != 3) {
      throw new Error("EntitityID tag shoudl have length of 3 chars");
    }
    // todo: validate tag.
    this.value = tag + "-" + uuid.v4();
  }

  static makeUserID(): EntityID { return new EntityID('USR'); }
  static makePOSID(): EntityID { return new EntityID('POS'); }
  static makeOrderID(): EntityID { return new EntityID('ORD'); }
  static makeProductID(): EntityID { return new EntityID('PRO'); }

  static fromExisting(id: string): EntityID {
    const newID = new EntityID(null);
    // todo: validate, add test
    newID.value = id;
    return newID;
  }

  toString() { return this.value; }

  equals(other: EntityID) { return _.isEqual(this, other); }
}

export {EntityID};
