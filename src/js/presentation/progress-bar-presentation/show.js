const SimpleProgressBar = require('./simple-progress-bar')

module.exports = function show(dom, datasetName, max, onClickDetailCheckbox) {
  // Clear old components.
  dom.innerHTML = ''

  // Append new components
  const simpleProgressBar = new SimpleProgressBar(datasetName, max, onClickDetailCheckbox)
  dom.appendChild(simpleProgressBar.dom)

  return simpleProgressBar
}
