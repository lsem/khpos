const techmap = require('../../TechMap/techMap');
var expect = require("chai").expect;

describe("TechMap", () => {
  it("Should load well formed yet possibly not valid tech map model JSON", () => {
    const instructionsText = JSON.stringify(
      `
    1. Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.
        3. Окремо відважити боршно в чисту і суху ємність відповідного об’єму.
      2. В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).
        `
    );

    const techMapJson =
      `{
      "units": [
        1, 6, 8, 10, 12, 14, 16, 18, 20
      ],

      "tasks": [
        {
        "name": "Замішування",
        "ingridients": [{
            "id": "ING-XXX-YYY-ZZZ-YYY",
            "countByUnits": {
              "1": 292,
              "6": 1752,
              "8": 2336,
              "10": 2920,
              "12": 3504,
              "14": 4088,
              "16": 4672,
              "18": 5256,
              "20": 5840
            }
          },
          {
            "id": "ING-XXX-YYY-ZZZ-YYY",
            "countByUnits": {
              "1": 163,
              "6": 978,
              "8": 1304,
              "10": 1630,
              "12": 1956,
              "14": 2282,
              "16": 2608,
              "18": 2934,
              "20": 3260
            }
          },
          {
            "id": "ING-XXX-YYY-ZZZ-YYY",
            "countByUnits": {
              "1": 78,
              "6": 468,
              "8": 624,
              "10": 780,
              "12": 936,
              "14": 1092,
              "16": 1248,
              "18": 1404,
              "20": 1560
            }
          }
        ],
        "humanResources": [{
            "count": 1,
            "timeNormsByUnit": {
              "1": 15,
              "6": 22,
              "8": 25,
              "10": 26,
              "12": 28,
              "14": 30,
              "16": 32,
              "18": 34,
              "20": 36
            }
          },
          {
            "count": 2,
            "timeNormsByUnit": {
              "1": 10,
              "6": 15,
              "8": 16,
              "10": 17,
              "12": 18,
              "14": 19,
              "16": 20,
              "18": 21,
              "20": 22
            }
          }
        ],
        "inventory": [{
          "id": "INV-XXX-YYY-ZZZ,YYY",
          "unitsByUnit": {
            "1": 1,
            "6": 1,
            "8": 1,
            "10": 1,
            "12": 1,
            "14": 1,
            "16": 2,
            "18": 2,
            "20": 2
          }
        }],
        "instructions": ${instructionsText}
      }]
    }`;
    const techMap = techmap.TechMap.load(techMapJson);

    expect(techMap).to.have.property('units');
    expect(techMap.units).to.be.a('function');
    expect(techMap.units()).to.deep.equal([1, 6, 8, 10, 12, 14, 16, 18, 20]);

    expect(techMap).to.have.property('tasks');
    expect(techMap.tasks).to.be.a('function');
    expect(techMap.tasks()).to.be.an('array');
    expect(techMap.tasks().length).to.equal(1);

    const tasks = techMap.tasks();
    expect(tasks[0]).to.be.an('object');

    expect(tasks[0]).to.have.property('name');
    expect(tasks[0].name).to.equal('Замішування');

    expect(tasks[0]).to.have.property('ingridients');
    expect(tasks[0].ingridients).to.be.an('array');
    expect(tasks[0].ingridients.length).to.equal(3);
    const firstIngridient = tasks[0].ingridients[0];
    expect(firstIngridient).to.be.an('object');

    expect(tasks[0]).to.have.property('humanResources');
    expect(tasks[0]).to.have.property('inventory');

    expect(tasks[0]).to.have.property('instructions');
    expect(tasks[0].instructions).to.be.a('function');
    expect(tasks[0].instructions().text()).to.deep.equal(instructionsText);

  })

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  it("Should parse instructions text as html ordered list items", () => {
    const instructions = new techmap.InstructionsText(
      `
1. Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.
    3. Окремо відважити боршно в чисту і суху ємність відповідного об’єму.
  2. В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).
    `
    )
    expect(instructions.asHtml()).to.equal(
      `
<li> Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму. </li>
<li> В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу). </li>
<li> Окремо відважити боршно в чисту і суху ємність відповідного об’єму. </li>`
    )
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////

});