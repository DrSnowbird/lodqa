module.exports = function bindModelToLoader(loader, model) {
  // Bind self to loader
  loader.on('sparqls', (sparqls) => model.sparqls = sparqls)
  loader.on('anchored_pgp', (anchoredPgp) => model.anchoredPgp = anchoredPgp)
  loader.on('solution',(newSolution) => model.addSolution(newSolution))

  relay(loader, model, ['ws_open', 'ws_close', 'error'])
}

function relay(loader, model, events) {
  for (const event of events) {
    loader.on(event, (...args) => model.emit(event, args))
  }
}