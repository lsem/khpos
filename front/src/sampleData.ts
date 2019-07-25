import TechMap from "./models/techMaps/techMap";
import Step from "./models/techMaps/step";
import IngredientsRow from "./models/techMaps/ingredientsRow";
import Ingredient from "./models/ingredients/ingredient";
import Device from "./models/inventory/device";
import HumanResourcesRow from "./models/techMaps/humanResourcesRow";
import EquipmentRow from "./models/techMaps/equipmentRow";
import TimeSpan from "./models/plan/timeSpan";
import Job from "./models/plan/job";

export function getTechMaps() : Array<TechMap> {
  return [
    {
      id: "TMP-XXX-YYY-ZZZ-YY0",
      name: "Хліб Французький (КХ)",
      units: [1, 6, 8, 10, 12, 14, 16, 18, 20],
      steps: [
        {
          id: "STP-XXX-YYY-ZZZ-YY0",
          name: "Замішування",
          ingredients: [
            { 
              ingredientId: "ING-XXX-YYY-ZZZ-YY0",
              countByUnits: new Map<number, number>([
                [1, 292],
                [6, 1752],
                [8, 2336],
                [10, 2920],
                [12, 3504],
                [14, 4088],
                [16, 4672],
                [18, 5256],
                [20, 5840],
              ])
            } as IngredientsRow,
            { 
              ingredientId: "ING-XXX-YYY-ZZZ-YY1",
              countByUnits: new Map<number, number>([
                [1, 163],
                [6, 978],
                [8, 1304],
                [10, 1630],
                [12, 1956],
                [14, 2282],
                [16, 2608],
                [18, 2934],
                [20, 3260],
              ])
            } as IngredientsRow,
            { 
              ingredientId: "ING-XXX-YYY-ZZZ-YY2",
              countByUnits: new Map<number, number>([
                [1, 78],
                [6, 468],
                [8, 624],
                [10, 780],
                [12, 936],
                [14, 1092],
                [16, 1248],
                [18, 1404],
                [20, 1560],
              ])
            } as IngredientsRow
          ],
          humanResources: [
            {
              peopleCount: 1,
              countByUnits: new Map<number, number>([
                [1, 15],
                [6, 22],
                [8, 25],
                [10, 26],
                [12, 28],
                [14, 30],
                [16, 32],
                [18, 34],
                [20, 36],                    
              ])
            } as HumanResourcesRow,
            {
              peopleCount: 2,
              countByUnits: new Map<number, number>([
                [1, 10],
                [6, 15],
                [8, 16],
                [10, 17],
                [12, 18],
                [14, 19],
                [16, 20],
                [18, 21],
                [20, 22],                    
              ])
            } as HumanResourcesRow
          ],
          inventory: [
            {
              deviceId: "INV-XXX-YYY-ZZZ,YY0",
              countByUnits: new Map<number, number>([
                [1, 1],
                [6, 1],
                [8, 1],
                [10, 1],
                [12, 1],
                [14, 1],
                [16, 2],
                [18, 2],
                [20, 2],                                    
              ])
            } as EquipmentRow
          ],
          instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
        } as Step,
        {
          id: "STP-XXX-YYY-ZZZ-YY1",
          name: "Аутоліз",
          ingredients: [],
          humanResources: [],
          inventory: [
            {
              deviceId: "INV-XXX-YYY-ZZZ,YY0",
              countByUnits: new Map<number, number>([
                [1, 1],
                [6, 1],
                [8, 1],
                [10, 1],
                [12, 1],
                [14, 1],
                [16, 2],
                [18, 2],
                [20, 2],                                    
              ])
            } as EquipmentRow
          ],
          instructions: `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
        } as Step
      ]
    } as TechMap
  ]
}

export function getIngredients(): Array<Ingredient> {
  return [
    {
      id: "ING-XXX-YYY-ZZZ-YY0",
      name: "Борошно пшеничне 1 гат",
      units: "г"
    },
    {
      id: "ING-XXX-YYY-ZZZ-YY1",
      name: "Вода",
      units: "мл"
    },
    {
      id: "ING-XXX-YYY-ZZZ-YY2",
      name: "Закваска пшенична",
      units: "г"
    }
  ]
}

export function getInventory(): Array<Device> {
  return [
    {
      id: "INV-XXX-YYY-ZZZ,YY0",
      name: "Спіральний тістоміс",
      units: "шт"
    }
  ]
}

export function getJobs(timeSpan: TimeSpan): Array<Job> {
  return [
    {
      id: "JOB-XXX-YYY-ZZZ,YY0",
      column: 0,
      startTime: timeSpan.fromDate,
      techMap: getTechMaps()[0],
      quantity: 1
    } as Job
  ]
}