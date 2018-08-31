import findIndex from "lodash/findIndex";

function indexOfOrDefault(arr, pred, def) {
  const idx = findIndex(arr, pred);
  return idx == -1 ? def : idx;
}
function autoLayout(items, mapper) {
  const layout = [];
  items.forEach(item => {
    const pos = indexOfOrDefault(
      layout,
      x => mapper.vend(x.item) < mapper.vbegin(item),
      layout.length
    );
    layout.push({
      col: pos,
      item: item
    });
  });
  return layout;
}

export default autoLayout;
