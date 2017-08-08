const Loader = require('./loader/load-solution')
const BindResult = require('./controller/bind-result')
const bindProgressPresentation = require('./controller/bind-progress-presentation')
const bindSearchButton = require('./controller/bind-search-button')
const bindStopSearchButton = require('./controller/bind-stop-search-button')
const anchoredPgpTablePresentation = require('./presentation/anchored-pgp-table-Presentation')
const answersPresentation = require('./presentation/answers-presentation')
const sparqlPresentation = require('./presentation/sparql-presentation')
const SparqlCount = require('./sparql-count')

document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150))

function init() {
  const loader = new Loader()
  const bindResult = new BindResult(loader.eventEmitter, 'lodqa-results')
  const sparqlCount = new SparqlCount()

  bindResult({
    sparqlCount: [
      () => sparqlCount.reset()
    ],
    anchoredPgp: [
      anchoredPgpTablePresentation.showAnchoredPgp,
      answersPresentation.setAnchoredPgp
    ],
    solution: [
      () => sparqlCount.increment(),
      (domId, data) => sparqlPresentation.show(domId, data, sparqlCount.count),
      (domId, data) => answersPresentation.showSolution(domId, data)
    ]
  })

  bindProgressPresentation(loader.eventEmitter)
  bindSearchButton(loader)
  bindStopSearchButton(loader)

  const checkbox = document.querySelector('#verbose')
  checkbox.addEventListener('change', (event) => sparqlPresentation.setVerbose(event.target.checked))
}
