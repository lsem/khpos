const _ = require('lodash');

class TechMapInventoryItem {
  id() {

  }

  unitsByUnit(unit) {

  }
}

class TechMapInventory {
  // Returns inventory items
  inventoryItems() {

  }
}

class InstructionsText {
  constructor(text) {
    this.text = text;
  }

  text() {
    return this.text;
  }

  asHtml() {
    let items = [];
    const regex = /(\s*)(\d)\.\s(.*)/gm;
    let match = regex.exec(this.text);
    //console.log('match: ', match)
    while (match !== null) {
      if (match.length !== 4) {
        throw new Error('There must be 4 groups to have this code working');
      }
      // const fullMatch = match[0];
      // const spacesGroup = match[1];
      const numberGroup = match[2];
      const textGroup = match[3];
      items.push({
        number: numberGroup,
        text: textGroup
      });
      //const item = `<li> ${numberGroup}: ${textGroup}\n </li>`;
      match = regex.exec(this.text);
    }
    const sortedItems = _.sortBy(items, "number")
    // render to html
    const htmlListItems = _.reduce(sortedItems, (text, item) => {
      return text + `\n<li> ${item.text} </li>`;
    }, "");
    return htmlListItems;
  }
}

class TechMapTask {
  constructor(taskData) {
    this._taskData = taskData;
  }

  get name() {
    return this._taskData.name;
  }

  get ingridients() {
    return this._taskData.ingridients;
  }

  get humanResources() {
    return this._taskData.ingridients;
  }

  get inventory() {
    return this._taskData.ingridients;
  }

  instructions() {
    return new InstructionsText(this._taskData.instructions);
  }
}

class TechMap {
  static load(techMapJson) {
    const tecMapObject = JSON.parse(techMapJson);
    return new TechMap(tecMapObject);
  }

  constructor(techMapObject) {
    if (!techMapObject) {
      throw new Error('No techMapObject');
    }
    this._techMap = techMapObject;
  }

  units() {
    return this._techMap.units;
  }

  tasks() {
    return _.map(this._techMap.tasks, task =>
      new TechMapTask(task)
    );
  }
}

module.exports = {
  InstructionsText,
  TechMap,
  TechMapInventory,
  TechMapInventoryItem
};