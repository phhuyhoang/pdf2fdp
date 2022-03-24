const DOM = require('../../../helpers/util/dom.util');


const template = `
<div class="form-field col-md-10 offset-md-1">
    <label for="{{id}}" class="form-field__checkbox">
        <input type="checkbox" name="{{name}}" id="{{id}}">
        <span class="checkmark">
            <i class="fa {{icon}}"></i>
        </span>
        <span class="statement">
            {{statement}}
        </span>
    </label>
</div>
`


function FormFieldCheckbox(id, name, icon, statement) {

  const { ancestor, descendant } = DOM.parse(template,
    {
      members: {
        input: '.form-field > label > input',
        icon: '.form-field > label > span > i',
        statement: '.form-field > label > .statement'
      },

      context: {
        id, name, icon, statement,
      }
    }
  );

  const root = ancestor;

  root.$input = descendant.input;
  root.$icon = descendant.icon;
  root.$statement = descendant.statement;

  return root;
}


module.exports = FormFieldCheckbox;
