// ------------------------------------------------------------------------------------------------
// (c) Kult Hliba, 2019.
//
// ------------------------------------------------------------------------------------------------
// poster-int/sync.js
// Defines functions for synchronization between KH soft and Poster soft.
// ------------------------------------------------------------------------------------------------
const _ = require('lodash');

// Computes diff between Poster data and KH data
function computeDiff(khToPosterTechMaps, khTechMaps, posterTechMaps) {
  console.log('entered!\n');
  let diff = {
    insertions: {kh: [], poster: []},
    deletions: {kh: [], poster: []},
    modifications: {kh: [], poster: []}
  };

  // find which kh tech maps have been created.
  _.forEach(khTechMaps, (x) => {
    if (khToPosterTechMaps[x.id] === undefined) {
      // kh tech map not present in mapping -> kh tm inserted
      diff.insertions.kh.push({id: x.id});
    }
  });

  // find which kh tech maps have been deleted.
  _.forOwn(khToPosterTechMaps, (posterId, khId) => {
    if (!_.find(khTechMaps, (x) => x.id == khId)) {        
      diff.deletions.kh.push({id: khId});
    }
  });

  // find which of poster tech maps have been changed.

  // find which of poster tech maps do not exist.

  // find which of KH tech maps do not extit.

  // find which of kh tech maps have been changed.


  return diff;
}

// Computes actions need to be executed in order to synchronize states.
function computeActions(diff) {}

module.exports = {
  computeDiff,
  computeActions
};
