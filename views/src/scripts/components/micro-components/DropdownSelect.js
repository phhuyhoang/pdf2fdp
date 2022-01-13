/**
 * Create a styled dropdown button
 */
function DropdownSelect(selects = []) {
  const style = {
    name: 'dropdown-select',
    number: 1,
  };

  const DropdownSelect = document.createElement('select');

  DropdownSelect.setSelectionList = function setSelectionList(selects = []) {
    DropdownSelect.innerHTML = '';
    for (const select of selects) {
      const option = document.createElement('option')
        .setHTMLAttributes({
          value: select.toLowerCase(),
        })
        .setParent(DropdownSelect)

      option.innerText = select;
    }
    return this;
  }

  DropdownSelect.applyStyle(style.name, style.number);
  DropdownSelect.setSelectionList(selects);

  return DropdownSelect;
}


module.exports = DropdownSelect;
