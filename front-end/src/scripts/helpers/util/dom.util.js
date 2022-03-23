module.exports.parse = function parseTemplate(template, options = {}) {
  let dom = template;
  const members = options.members || Object.create(null);
  const context = options.context || Object.create(null);

  const membersList = Object.keys(members);
  const propsList = Object.keys(context);

  for (const prop of propsList) {
    const expression = `{{${prop}}}`
    dom = dom.split(expression).join(context[prop]);
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = dom;

  const ancestor = wrapper.firstElementChild;
  const descendant = Object.create(null);

  wrapper.innerHTML = '';

  for (const member of membersList) {
    const selector = members[member];
    const element = ancestor.querySelector(selector);
    descendant[member] = element;
  }

  return {
    ancestor,
    descendant,
  }

}
