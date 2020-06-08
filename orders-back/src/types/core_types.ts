import {ValidationError} from "app/errors";
import * as joi from "joi";
import _ from 'lodash';
import * as uuid from "uuid";

import {TypedUUIDSchema2} from './schemas';

const ValidTags = [ 'USR', 'POS', 'ORD', 'GOO' ];
const ValidIDSSchema = TypedUUIDSchema2(ValidTags);

export type EID = string;

// Wrapper around string.
export class EIDFac {
  value: string = "";

  static newTagged(tag: string, existingUUID: string|undefined = undefined) {
    if (existingUUID) {
      return tag + "-" + existingUUID;
    }
    if (!ValidTags.find((t) => tag === t)) {
      throw new ValidationError(`tag ${tag} is valid for EID`);
    }
    return tag + "-" + uuid.v4();
  }

  static makeUserID(): EID { return EIDFac.newTagged('USR'); }
  static makePOSID(): EID { return EIDFac.newTagged('POS'); }
  static makeRawPOSID(uuid: string): EID { return EIDFac.newTagged('POS', uuid); }
  static makeOrderID(): EID { return EIDFac.newTagged('ORD'); }
  static makeGoodID(): EID { return EIDFac.newTagged('GOO'); }
  static makeRawGoodID(uuid: string): EID { return EIDFac.newTagged('GOO', uuid); }

  static fromExisting(id: string): EID {
    const result = joi.validate(id, ValidIDSSchema);
    if (result.error) {
      throw new ValidationError(result.error.message);
    }
    return id;
  }
}

export class Day {
  val: number;
  constructor(daysSinceEpoch: number) { this.val = daysSinceEpoch; }
  static fromDate(date: Date) {
    if (!(date instanceof Date && !isNaN(date as any))) {
      throw "Invalid date";
    }
    return new Day(Math.floor((date.getTime() / 1000) / 86400));
  }

  static today() { return Day.fromDate(new Date()); }
};

