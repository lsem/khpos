import _ from "lodash";

function autoLayout_dumb(items, mapper) {
  const layout = [];
  items.forEach((item, item_idx) => {
    layout.push({ col: layout.length, item: item });
  });
  return layout;
}

function autoLayout(items, mapper) {
  function dumpLayout(l) {
    return JSON.stringify(
      l.map(x => {
        return {
          col: x.col,
          starts: mapper.vbegin(x.item) / 1000 / 60 / 60,
          ends: mapper.vend(x.item) / 1000 / 60 / 60
        };
      })
    );
  }

  const startsAt = mapper.vbegin;
  const endsAt = mapper.vend;

  const layout = [];
  items.forEach((item, item_idx) => {
    // console.log("Trying to place: " + edentity(item));
    // go over all existing columns and see if there is a space between tasks,
    // if no, put into new column.
    const columns = layout.map(x => x.col);
    const foundCol = _.find(columns, c => {
      // lets try to put item into this column.
      let testedLayout = layout.slice();
      testedLayout.push({ col: c, item: item });

      const columnItems = _.sortBy(
        _.filter(testedLayout, x => x.col === c),
        x => startsAt(x.item)
      );

      const overlaped = (a1, b1, a2, b2) => {
        return !(b1 < a2) && !(a1 > b2);
      };

      // todo: make functional?
      let hasSpaceForItem = true;
      for (let j = 0; j < columnItems.length - 1; ++j) {
        const p = columnItems[j],
          q = columnItems[j + 1];
        if (
          overlaped(
            startsAt(p.item),
            endsAt(p.item),
            startsAt(q.item),
            endsAt(q.item)
          )
        ) {
          hasSpaceForItem = false;
          break;
        }
      }
      return hasSpaceForItem;
    });

    if (!_.isUndefined(foundCol)) {
      layout.push({ col: foundCol, item: item });
    } else {
      layout.push({ col: layout.length, item: item });
    }
  });
  return layout;
}

export { autoLayout, autoLayout_dumb };

// const items = [
//   {
//     vOffset: 100,// (starts at 100)
//     vHeight: 900 // (ends at 1000)
//   },
//   {
//     vOffset: 400,// (starts at 400)
//     vHeight: 300 // (ends at 700)
//   },
//   {
//     vOffset: 200,// (starts at 200)
//     vHeight: 300 // (ends at 500)
//   },
//   {
//     vOffset: 510,// (starts at 510)
//     vHeight: 300 // (ends at 810)
//   },
//   {
//     vOffset: 1500,// (starts at 1500)
//     vHeight: 100  // (ends at 1600)
//   }
// ];
