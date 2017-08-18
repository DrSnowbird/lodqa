const getCurrentSparql = require('../get-current-sparql')
const showError = require('../show-error')
const getNumberOfAnswers = require('../get-number-of-answers')

module.exports = function stop(domId, sparqlCount, errorMessage = '') {
  // The sparql count must be incremented because the next solution is not arrived yet.
  const current = getCurrentSparql(domId, sparqlCount + 1)

  if (current) {
    // If there is errorMessage, show it with a bomb icon.
    if (errorMessage) {
      showError(current, errorMessage)
    } else {
      // If a conneciton of websocket is closed, hide the spinner icon
      if (!current.querySelector('.fa-bomb')) {
        getNumberOfAnswers(current)
          .innerHTML = ''
      }
    }
  }
}