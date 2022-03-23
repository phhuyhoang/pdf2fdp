/**
 * Create a styled dropdown button
 */
function DropdownSelect(selections = []) {
  const style = {
    name: 'dropdown-select',
    number: 1,
  };

  const root = document.createElement('select');


  root.setSelectionList = function setSelectionList(selections = []) {
    while (root.firstChild) root.removeChild(root.firstChild);

    for (const selection of selections) {
      const option = document.createElement('option')
        .setHTMLAttributes({
          value: selection.toLowerCase(),
        })
        .setParent(root);

      option.innerText = selection;
    }

    return this;
  }

  root.applyStyle(style.name, style.number);
  root.setSelectionList(selections);

  return root;
}


module.exports = DropdownSelect;
