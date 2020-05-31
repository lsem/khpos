import {ValidationError} from "app/errors";
import * as joi from "joi";
import _ from 'lodash';
import * as uuid from "uuid";

import {TypedUUIDSchema2} from './schemas';

const ValidTags = [ 'USR', 'POS', 'ORD', 'GOO' ];
const ValidIDSSchema = TypedUUIDSchema2(ValidTags);

// Wrapper around string.
class EID {
  value: string = "";

  static newTagged(tag: string, existingUUID: string|undefined = undefined) {
    if (existingUUID) {
      const newId = new EID();
      newId.value = tag + "-" + existingUUID;
      return newId;
    }
    if (!ValidTags.find((t) => tag === t)) {
      throw new ValidationError(`tag ${tag} is valid for EID`);
    }
    const newId = new EID();
    newId.value = tag + "-" + uuid.v4();
    return newId;
  }

  static makeUserID(): EID { return EID.newTagged('USR'); }
  static makePOSID(): EID { return EID.newTagged('POS'); }
  static makeRawPOSID(uuid: string): EID { return EID.newTagged('POS', uuid); }
  static makeOrderID(): EID { return EID.newTagged('ORD'); }
  static makeGoodID(): EID { return EID.newTagged('GOO'); }

  static fromExisting(id: string): EID {
    const newID = new EID();
    const result = joi.validate(id, ValidIDSSchema);
    if (result.error) {
      throw new ValidationError(result.error.message);
    }
    newID.value = id;
    return newID;
  }

  toString() { return this.value; }

  equals(other: EID) { return _.isEqual(this, other); }
}

export {EID};
