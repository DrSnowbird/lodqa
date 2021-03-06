const Handlebars = require('handlebars')
const updateDomTree = require('../update-dom-tree')

module.exports = class {
  constructor(dom, model) {
    model.on('progress_datasets_update_event', () => render(dom, model))
  }
}

const template = Handlebars.compile(`
  {{#each this}}
    <div class="datasets-progressbar__infomation">
      <span class="datasets-progressbar__label">{{name}}</span>
      <div>
        <input type="checkbox" id="datasets-progressbar__checkbox__{{name}}" data-name="{{name}}" class="datasets-progressbar__checkbox" {{#if show}}checked="checked"{{/if}}>
        <label for="datasets-progressbar__checkbox__{{name}}">Details</label>
      </div>
    </div>
    <div class="datasets-progressbar__progress">
      <progress class="datasets-progressbar__progressbar" value="{{value}}" max="{{max}}"></progress>
      <span class="datasets-progressbar__progress-label">{{percentage}}%</span>
    </div>
  {{/each}}
`)

function render(dom, model) {
  const html = template(model.snapshot)
  updateDomTree(dom, html)
}
