import {ValidationError} from "app/errors";
import * as joi from "joi";
import _ from 'lodash';
import * as uuid from "uuid";

import {TypedUUIDSchema2} from './schemas';

const ValidTags = [ 'USR', 'POS', 'ORD', 'GOO'];
const ValidIDSSchema = TypedUUIDSchema2(ValidTags);

// Wrapper around string.
class EntityID {
  value: string = "";

  static newTagged(tag: string) {
    if (!ValidTags.find((t) => tag === t)) {
      throw new ValidationError(`tag ${tag} is valid for EntityID`);
    }
    const newId = new EntityID();
    newId.value = tag + "-" + uuid.v4();
    return newId;
  }

  static makeUserID(): EntityID { return EntityID.newTagged('USR'); }
  static makePOSID(): EntityID { return EntityID.newTagged('POS'); }
  static makeOrderID(): EntityID { return EntityID.newTagged('ORD'); }
  static makeGoodID(): EntityID { return EntityID.newTagged('GOO'); }

  static fromExisting(id: string): EntityID {
    const newID = new EntityID();
    const result = joi.validate(id, ValidIDSSchema);
    if (result.error) {
      throw new ValidationError(result.error.message);
    }
    newID.value = id;
    return newID;
  }

  toString() { return this.value; }

  equals(other: EntityID) { return _.isEqual(this, other); }
}

export {EntityID};
