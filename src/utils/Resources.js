import * as PIXI from 'pixi.js'

export default class Resources {
  static urlMap = {};

  static loadAll() {
    return new Promise((resolve, reject) => {
      if (Object.values(Resources.urlMap).length === 0) {
        resolve()
        return
      }

      for (const key in Resources.urlMap) {
        PIXI.Loader.shared.add(key, Resources.urlMap[key])
      }

      PIXI.Loader.shared.load((loader, resources) => {
        resolve()
      })
    })
  }

  static get(key) {
    if (!PIXI.Loader.shared.resources.hasOwnProperty(key)) {
      throw new Error('Resource ' + key + ' not found')
    }
    return PIXI.Loader.shared.resources[key].data
  }
}