import * as PIXI from 'pixi.js'
import { EventEmitter } from 'eventemitter3'

export var CurrencyEvent;
(function(CurrencyEvent) {
  CurrencyEvent['Change'] = 'CurrencyEvent.Change'
})(CurrencyEvent || (CurrencyEvent = {}))

export class CurrencyManager extends EventEmitter {
  constructor() {
    super()
    this._currency = null
    this._textures = new Map()
    this._options = new Map()
  }

  setTextureFromUrl(type, key, src) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
      image.onload = () => {
        const textures = this.getCurrencyTextures(type)

        if (textures) {
          textures[key] = new PIXI.Texture(new PIXI.BaseTexture(image))
        }
        resolve()
      }
      image.onerror = () => reject()
    })
  }

  createSprite(key, currency = null) {
    currency = currency ? currency : this._currency

    const texture = this.getTexture(key, currency)
    const sprite = new PIXI.Sprite(texture)
    const options = this.getOptions(currency)

    if (options) {
      sprite.scale.set(1 / options.scale)
    }

    return sprite
  }

  setTextureFromBaseTexture(type, key, src) {
    const textures = this.getCurrencyTextures(type)
    if (textures) {
      textures[key] = src
    }
    return Promise.resolve()
  }

  async parseData(props) {
    let { type, precision, scale, sources } = props

    if (!scale) {
      scale = 1
    }

    if (!precision) {
      precision = 0
    }

    if (!this._options.has(type)) {
      this._options.set(type, { scale, precision })
    }
    if (!this._textures.has(type)) {
      this._textures.set(type, [])
    }

    await Promise.all(sources.map((({ src, key }, index) => {
      switch (typeof src) {
        case 'string':
          return this.setTextureFromUrl(type, key, src)
        case 'object':
          return this.setTextureFromBaseTexture(type, key, src)
        default:
          throw new Error('Wrong source with index=' + index)
      }
    })))
  }

  async setData(props) {
    this.release()

    await Promise.all(props.map(this.parseData))
  }

  release(currency = null) {
    this.getCurrencyTextures(currency).forEach(texture => {
      texture.destroy()
    })
    this._currency = null
    this._textures.clear()
    this._options.clear()
  }

  getTexture(key, currency = null) {
    currency = currency ? currency : this._currency
    if (!this._textures.has(currency)) {
      throw new Error('Texture not found key=' + key)
    }
    return this._textures.get(currency)[key]
  }

  getCurrencyTextures(currency = null) {
    currency = currency ? currency : this._currency
    return this._textures.has(currency) ? this._textures.get(currency) : []
  }

  setCurrency(currency) {
    this._currency = currency
    this.emit(CurrencyEvent.Change, currency)
  }

  getOptions(currency) {
    return this._options.get(currency)
  }

  getCurrency() {
    return this._currency
  }
}
