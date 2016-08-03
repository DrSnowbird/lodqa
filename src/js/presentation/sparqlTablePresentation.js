var _ = require('lodash'),
  instance = require('./instance'),
  makeTemplate = require('../render/makeTemplate'),
  reigonTemplate = makeTemplate(function() {
    /*
    <div class="result-region">
        <table class="sparql-table">
            <tr>
                <th>sparql</th>
                <th>answer</th>
            </tr>
            <tr>
                <td class="sparql">{{sparql}}</td>
                <td><ul class="answer-list list-in-table"></ul></td>
            </tr>
        </table>
    </div>
    */
  }),
  instanceTemplate = makeTemplate(function() {
    /*
    <li>{{instance}}</li>
    */
  }),
  toLastOfUrl = require('./toLastOfUrl'),
  privateData = {}

module.exports = {
  onAnchoredPgp: function(domId, anchored_pgp) {
    privateData.domId = domId
    privateData.focus = anchored_pgp.focus
  },
  onSparql: function(sparql) {
    var html = reigonTemplate.render({
        sparql: sparql
      }),
      $region = $(html)

    privateData.currentAnswerList = $region.find('.answer-list')

    $('#' + privateData.domId)
      .append($region)
  },
  onSolution: function(solution) {
    var focusInstanceId = _.first(
        Object.keys(solution)
        .filter(instance.is)
        .filter(_.partial(instance.isNodeId, privateData.focus))
      ),
      label = toLastOfUrl(solution[focusInstanceId])

    privateData.currentAnswerList
      .append(
        instanceTemplate.render({
          instance: label
        })
      )
  }
}
