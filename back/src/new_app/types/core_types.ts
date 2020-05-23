import * as uuid from "uuid";

// Wrapper around string.
class EntityID {
  innerStr: string = "";

  constructor(tag: string) {
    if (tag.length != 3) {
      throw new Error("EntitityID tag shoudl have length of 3 chars");
    }
    // todo: validate tag.
    this.innerStr = tag + "-" + uuid.v1();
  }

  toString() {
    return this.innerStr;
  }
}

export { EntityID };
