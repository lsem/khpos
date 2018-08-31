import findIndex from "lodash/findIndex";

function autoLayout(items, mapper) {
  const layout = [];
  items.forEach(item => {
    const idx = findIndex(
      layout,
      x => mapper.vend(x.item) < mapper.vbegin(item)
    );
    const pos = idx == -1 ? layout.length : idx;
    layout.push({ col: pos, item: item });
  });
  return layout;
}

export default autoLayout;
