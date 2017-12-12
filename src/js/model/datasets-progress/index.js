const {
  EventEmitter
} = require('events')
const DatasetProgress = require('./dataset-progress')

module.exports = class extends EventEmitter {
  constructor(loader) {
    super()

    this._visible = false
    this._datasets = new Map()

    // A Dataset with bgps will have SPARQLs
    loader.on('bgps', ({
      dataset,
      bgps
    }) => {
      if (!this._datasets.has(dataset)) {
        this._datasets.set(dataset, new DatasetProgress(dataset))
      }

      const progress = this._datasets.get(dataset)
      progress.max += bgps.length
      this.emit('progress_datasets_update_event')
    })

    loader.on('solutions', ({
      dataset
    }) => {
      const progress = this._datasets.get(dataset)
      progress.value += 1
      this.emit('progress_datasets_update_event')
    })
  }

  set visible(visible) {
    this._visible = visible
    this.emit('progress_datasets_update_event')
  }

  showDataset(dataset, isShow) {
    // Hide all datasets
    for (const progress of this._datasets.values()) {
      progress.show = false
    }

    // Show or hide the specific dataset
    Array.from(this._datasets.entries())
      .filter(([name]) => name === dataset)
      .forEach(([, progress]) => progress.show = isShow)

    this.emit('progress_datasets_update_event')
  }

  get snapshot() {
    if (!this._visible) {
      return []
    }

    return Array.from(this._datasets.values())
      .map((progress) => ({
        name: progress.name,
        max: progress.max,
        value: progress.value,
        percentage: progress.percentage,
        show: progress.show
      }))
  }
}
