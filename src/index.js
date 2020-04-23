import { App } from './App'
import { EventEmitter } from 'events'

import config from './configs/config'

document.addEventListener('DOMContentLoaded', () => {
  window.eventBus = new EventEmitter()

  window.app = new App()
  window.app.init(config, window.eventBus)
})

window.addEventListener('beforeunload', (e) => {
  window.app.disconnect()
    .then(e => {
    })
}, false)

window.addEventListener('message', e => {
  if (e.data === 'close') {
    if (window.app && window.app.gameModel.get('connected')) {
      window.app.disconnect()
        .then(response => {
          e.source.postMessage('isClose', '*')
        })

    } else {
      e.source.postMessage('isClose', '*')
    }
  }
})