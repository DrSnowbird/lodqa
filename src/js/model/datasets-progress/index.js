const {
  EventEmitter
} = require('events')
const DatasetProgress = require('./dataset-progress')

module.exports = class extends EventEmitter {
  constructor(loader) {
    super()

    this._showProgressPerDataset = false
    this._datasets = new Map()

    // The number of bpgs is same the number of SPARQLs.
    loader.on('simple:sparql', ({
      dataset,
      sparql
    }) => {
      getDataset(this._datasets, dataset.name)
        .addSparql(sparql)
      this.emit('progress_datasets_update_event')

      if (dataset.name === this._selectdDataset) {
        this.emit('progress_selected_dataset_update_event')
      }
    })

    loader.on('simple:query_sparql', ({
      dataset,
      sparql
    }) => {
      getDataset(this._datasets, dataset.name)
        .startSparql(sparql)
      this.emit('progress_datasets_update_event')

      if (dataset.name === this._selectdDataset) {
        this.emit('progress_selected_dataset_update_event')
      }
    })

    loader.on('simple:solutions', ({
      dataset,
      anchored_pgp,
      sparql,
      solutions,
      error
    }) => {
      getDataset(this._datasets, dataset.name)
        .finishSparql(error, anchored_pgp, sparql, solutions)
      this.emit('progress_datasets_update_event')

      if (dataset.name === this._selectdDataset) {
        this.emit('progress_selected_dataset_update_event')
      }
    })
  }

  set showProgressPerDataset(visible) {
    this._showProgressPerDataset = visible
    this.emit('progress_datasets_update_event')
    this.emit('progress_selected_dataset_update_event')
  }

  showDataset(dataset, isShow) {
    // Show or hide the specific dataset
    if (isShow) {
      this._selectdDataset = dataset
    } else {
      this._selectdDataset = null
    }

    this.emit('progress_datasets_update_event')
    this.emit('progress_selected_dataset_update_event')
  }

  hideSparql(dataset, sparqlNumber, show) {
    this._datasets.get(dataset)
      .toggleAnswerVisibility(sparqlNumber, show)
  }

  get stateOfSparqlsOfSelectedDataset() {
    if (this._showProgressPerDataset && this._selectdDataset) {
      return {
        show: true,
        name: this._selectdDataset,
        sparqls: this._datasets.get(this._selectdDataset)
          .snapshot
      }
    }

    return {
      show: false,
      sparqls: []
    }
  }

  get snapshot() {
    if (!this._showProgressPerDataset) {
      return []
    }

    return Array.from(this._datasets.values())
      .map((progress) => ({
        name: progress.name,
        max: progress.max,
        value: progress.value,
        percentage: progress.percentage,
        show: progress.name === this._selectdDataset
      }))
  }
}

// Supports out-of-order events
function getDataset(datasets, name) {
  if (!datasets.has(name)) {
    datasets.set(name, new DatasetProgress(name))
  }

  return datasets.get(name)
}
