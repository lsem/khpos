const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const should = require('chai').should;
const posterSync = require('../../../poster-int/sync');
const uuid = require('uuid');
const _ = require('lodash');

function newTechMapId() {
  return 'TM-' + uuid.v4()
}

// --------------------------------------------------------------------------------

// TODO:
//  Keep last synced Poster Techmap cached locally. Then compare current one
// with cached one. If something has changed, we can either completely
// reacreated techmap.
//  This can have impact on data integrity inside poster.
//  Hard way is to modify existing poster techmap without deleting or recreating
//  it. We can start from recreating then, if needed, develop more sophisticated
//  implementation.
//
//
//

// function* mutateTM(tm) {
//     const fieldsMutators = {
//         'id': idMutator,
//         'name': textMutator,
//         'units': unitsFieldMutator,
//         'steps': stepFieldMutator,
//         'ingredients': ingridientsMutator,
//         'ingredientId': idMutator,
//         'countByUnits': countByUnitsMutator,
//         'humanResources': humanResourcesMutator,
//         'peopleCount': countMutator,
//         'inventory': inventoryMutator,
//         'deviceId': idMutator,
//         'instructions': textMutator,
//       };

//     const idMutator = function*(id) {
//         yield id + '_mutatedId';
//       };

//       const textMutator = function*(text) {
//           yield text + '_mutatedText';
//       };

//       const unitsFieldMutator = function*(units) {
//           // [1, 6]
//           // insert back
//           const unitsCopy = _.cloneDeep(units);
//           unitsCopy.push(10);
//           yield unitsCopy;

//           // insert front
//           const unitsCopy2 = _.cloneDeep(units);
//           unitsCopy2.unshift(10);
//           yield unitsCopy2;

//           // remove back, shuffle
//           if (units.length > 0) {
//             const unitsCopy3 = _.cloneDeep(units);
//             unitsCopy3.pop();
//             yield unitsCopy3;

//             yield _.shuffle(units);
//           }
//       };

//       const stepFieldMutator = function*(steps) {
//         const stepsCopy = _.cloneDeep(steps);
//         stepsCopy[id] = stepsCopy[id]
        
//       };
      
//       const techMapMutator = function*(tm) {
//           const mutatedTm = _.cloneDeep(tm);
//         _.forEach(_.keys(baseKHTechMap), (key) => {
//           console.assert(
//               typeof fieldsMutators[key] === 'function',
//               `No mutator avaiable for key ${key}`);
//           for (let mutatedVal of fieldsMutators[key](tm[key])) {
//               mutatedTm[key] = mutatedVal;
//               yield mutatedTm;
//           }
//         });
//       };
      
//       return techMapMutator;
// }

// API Description:
// https://dev.joinposter.com/docs/v3/web/menu/getProducts
describe('Poster Sync Diff Tests', () => {
  describe('kh techmap inserted', () => {
    const khBreadID = newTechMapId();
    const khToPosterTechMaps = {};
    const khTechMaps = [{id: khBreadID}];
    const posterTechMaps = [];
    const diff =
        posterSync.computeDiff(khToPosterTechMaps, khTechMaps, posterTechMaps);
    console.log('returned: ' + JSON.stringify(diff));
    expect(diff).to.be.deep.equal({
      insertions: {kh: [{id: khBreadID}], poster: []},
      deletions: {kh: [], poster: []},
      modifications: {kh: [], poster: []}
    });
    console.log('passed!\n');
  });

  // -------------------------------------------------------

  describe('kh techmap deleted', () => {
    // Case when techmap was previously syncrhonized with Poster
    // but now is deleted. Diff should produce deletion of KH tech map.
    const khBreadID = newTechMapId();
    const posterBreadID = newTechMapId();
    const khToPosterTechMaps = {};
    khToPosterTechMaps[String(khBreadID)] = String(posterBreadID);
    const khTechMaps = [];
    const posterTechMaps = [{id: posterBreadID}];

    const diff =
        posterSync.computeDiff(khToPosterTechMaps, khTechMaps, posterTechMaps);

    expect(diff).to.be.deep.equal({
      insertions: {kh: [], poster: []},
      deletions: {kh: [{id: khBreadID}], poster: []},
      modifications: {kh: [], poster: []}
    });
  });

  // -------------------------------------------------------

  describe('kh techmap modified (basic)', () => {
    // Case when KH techmap was previously synchronized with Poster
    // but now differs from Poster one.
    const khBreadID = newTechMapId();
    const posterBreadID = newTechMapId();
    const khToPosterTechMaps = {};
    khToPosterTechMaps[String(khBreadID)] = String(posterBreadID);
    const posterTechMaps = [{id: posterBreadID}];

    // generate mutations for kh techmap
    // we change each the field of kh tech map
    const baseKHTechMap = {
      id: 'id',
      name: 'Хліб Французький (КХ)',
      units: [1, 6],
      steps: [{
        id: 'STP',
        name: 'Замішування',
        ingredients:
            [{ingredientId: 'ING', countByUnits: [[1, 292], [6, 1752]]}],
        humanResources: [{peopleCount: 1, countByUnits: [[1, 15], [6, 22]]}],
        inventory: [{deviceId: ('INV'), countByUnits: [[1, 1], [6, 1]]}],
        instructions:
            `{"blocks":[{"key":"2ic2d","text":"Відважити воду та пшеничну закваску в чисту і суху ємність відповідного об'єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7pdcs","text":"Окремо відважити боршно в чисту і суху ємність відповідного об’єму.","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"an4s6","text":"В спіральному тістомісі змішати компоненти з послідовності (1) на протязі 4—5 хвилин (в залежності від кількості замісу).","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
      }]
    };

    // const diff =
    //     posterSync.computeDiff(khToPosterTechMaps, khTechMaps,
    //     posterTechMaps);
  });



  //   describe('should detect Poster insertions when KH database is empty', ()
  //   => {
  //     const khToPosterTechMaps = {};
  //     const posterTechMaps = [
  //       {
  //         product_name: 'Кальян с сюрпризом',
  //         menu_category_i: 151,
  //         workshop: 4,
  //         id: 11,
  //         ingredient: [{id: 813, type: '1', unit: 'kg'}]
  //       },
  //       {
  //         product_name: 'Кальян с мочой',
  //         menu_category_i: 151,
  //         workshop: 5,
  //         id: 12,
  //         ingredient: [{id: 813, type: '2', unit: 'kg'}]
  //       }
  //     ];
  //     const khTechMaps = {};

  //     const diff =
  //         posterSync.techMapsDiff(khToPosterTechMaps, posterTechMaps,
  //         khTechMaps);

  //     expect(diff).to.deep.equal({
  //       insertions: [
  //         {
  //           product_name: 'Кальян с сюрпризом',
  //           menu_category_i: 151,
  //           workshop: 4,
  //           id: 11,
  //           ingredient: [{id: 813, type: '1', unit: 'kg'}]
  //         },
  //         {
  //           product_name: 'Кальян с мочой',
  //           menu_category_i: 151,
  //           workshop: 5,
  //           id: 12,
  //           ingredient: [{id: 813, type: '2', unit: 'kg'}]
  //         }
  //       ]
  //     });
  //   });

  // --------------------------------------------------------------------------------

  //   describe('should detect Poster deletions', () => {
  //     const capuccinoKHID = newTechMapId();
  //     const capuccinoPosterID = 25;
  //     const khToPosterTechMaps = {capuccinoKHID, capuccinoPosterID};
  //     const posterTechMaps = [];

  //     // For detecting deletion, no fileds needed except id.
  //     const khTechMaps = [{
  //       id: capuccinoPosterID,
  //     }];

  //     const diff =
  //         posterSync.techMapsDiff(khToPosterTechMaps, posterTechMaps,
  //         khTechMaps);

  //     expect(diff).to.be({deletions: [{id: capuccinoPosterID}]});
  //   });

  //   //
  //   --------------------------------------------------------------------------------

  //   describe('should detect tech map modifications', () => {
  //     const capuccinoKHID = newTechMapId();
  //     const capuccinoPosterID = 25;

  //     const khToPosterTechMaps = {capuccinoKHID, capuccinoPosterID};

  //     const posterTechMaps =
  //         [{id: capuccinoKHID, product_name: 'Хліб Французький (КХ)'}];

  //     const khTechMaps = [{id: capuccinoPosterID, name: 'Хліб Французький'}];

  //     const diff =
  //         posterSync.techMapsDiff(khToPosterTechMaps, posterTechMaps,
  //         khTechMaps);

  //     expect(diff).to.be({
  //       modifications: [{
  //         id: capuccinoPosterID,
  //       }]
  //     });
  //   });

  //   //
  //   --------------------------------------------------------------------------------

  //   describe(
  //       'should detect tech map modifications when more than one techmap
  //       modifications exist',
  //       () => {
  //         const capuccinoKHID = newTechMapId();
  //         const capuccino2PosterID = 25;
  //         const capuccino4PosterID = 26;

  //         const khToPosterTechMaps = {
  //             capuccinoKHID: {capuccino2PosterID, capuccino4PosterID}
  //         };

  //         const posterTechMaps =
  //             [{id: capuccinoKHID, product_name: 'Хліб Французький (КХ)'}];

  //         const khTechMaps = [{id: capuccinoPosterID, name: 'Хліб
  //         Французький'}];

  //         const diff = posterSync.techMapsDiff(
  //             khToPosterTechMaps, posterTechMaps, khTechMaps);

  //         expect(diff).to.be({
  //           modifications: [{
  //             id: capuccinoPosterID,
  //           }]
  //         });
  //       });
});

// TODO: test that diff can detect ALL insertions, deletions, modifications
// (i.e. it is not stopping after first detected difference).
// TODO: Add corner cases: no diffs, empty collections, etc..