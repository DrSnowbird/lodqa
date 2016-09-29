module.exports = function(loader) {
  const button = document.querySelector('#stopSearch')

  loader
    .on('ws_open', () => button.disabled = false)
    .on('ws_close', () => button.disabled = true)

  button.addEventListener('click', (e) => {
    document.querySelector('#beginSearch').classList.toggle('hidden')
    e.target.classList.toggle('hidden')
    loader.stopSearch()
  })
}
