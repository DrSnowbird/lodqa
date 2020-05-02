const getDataset = require('./get-dataset')
const Sparql = require('./sparql')

module.exports = function(datasets, datasetName, sparql, anchoredPgp, option) {
  const dataset = getDataset(datasets, datasetName)
  if (dataset.has(sparql.number)) {
    // Update an existing sparql.
    dataset.get(sparql.number)
      .extend(option)
  } else {
    const s = new Sparql(anchoredPgp, sparql.query)
      .extend(option)
    dataset.set(sparql.number, s)
  }
}
