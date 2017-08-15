const findLabel = require('../find-label')
const answerList = require('./answer-list')
const solutionTable = require('./solution-table')
const solutionGraph = require('./graph')
const render = require('./render')
const getUniqUrls = require('./get-uniq-urls')

const privateData = {}

class AnswersPresentation {
  setAnchoredPgp(anchored_pgp) {
    privateData.anchoredPgp = anchored_pgp
  }

  showSolution(dom, data) {
    const {
      bgp,
      solutions
    } = data

    if (solutions.length === 0) {
      return
    }

    const list = answerList(solutions, privateData.anchoredPgp.focus)
    const table = solutionTable(solutions)
    const graph = solutionGraph(privateData.anchoredPgp, bgp, solutions)

    render(dom, list, table, graph)

    findLabel(getUniqUrls(solutions), (url, label) => {
      // Update labels in the list, the table and the graph
      [list.updateLabel, table.updateLabel, graph.updateLabel]
        .filter((func) => func)
        .forEach((func) => func(url, label))
    })
  }
}

module.exports = new AnswersPresentation
