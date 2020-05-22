import _ from 'underscore'
import * as PIXI from 'pixi.js'

import Backbone from 'backbone'
import DeepModel from '../utils/DeepModel'

export default class Widget extends PIXI.Container {
  static linearGradient(from, to, width, height) {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    const grd = ctx.createLinearGradient(0, 0, width, height)

    grd.addColorStop(0, from)
    grd.addColorStop(1, to)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, width, height)

    return new PIXI.Texture.from(c)
  }

  static radialGradient(from, to, fromRadius, toRadius, width, height) {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    const grd = ctx.createRadialGradient(0, 0, fromRadius, width, height, toRadius)

    grd.addColorStop(0, from)
    grd.addColorStop(1, to)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, width, height)

    return new PIXI.Texture.from(c)
  }

  constructor(props = {}) {
    super()

    this.model = new DeepModel(_.deepExtend({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      alpha: 1,
      margin: {
        x: 0,
        y: 0,
      },
      mask: {
        width: 0,
        height: 0,
        enabled: false,
      },
      visible: true,
      interactive: false,
      buttonMode: true,
    }, props || {}))

    this.maskGraphics = new PIXI.Graphics()
    this.maskGraphics.interactive = false
    this.maskGraphics.interactiveChildren = false

    for (const key in this.model.attributes) {
      if (this.model.attributes[key] instanceof Backbone.Model) {
        for (const _key in this.model.attributes) {
          this.model.attributes[key].on('change:' + _key, (e) => {
            this.redraw(e.changed)
          })
        }

      } else {
        this.model.on('change:' + key, (e) => {
          this.redraw(e.changed)
        })
      }
    }
  }

  set(key, val, options) {
    if (typeof key === 'string') {
      this.model.set(key, val, options)

    } else {
      this.model.set(_.deepExtend(_.deepClone(this.model.attributes), key), val)
    }
  }

  get(key) {
    return this.model.get(key)
  }

  update(dt) {
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('mask' in changed) {
      if (changed.mask.enabled) {
        this.mask = this.maskGraphics
        this.addChildAt(this.maskGraphics, 1)

        this.mask.clear()
        this.mask.beginFill(0x000000)
        this.mask.drawRect(0, 0, this.get('mask').width, this.get('mask').height)
        this.mask.endFill()

      } else {
        if (this.mask) {
          this.removeChild(this.mask)
          this.mask = null
        }
      }
    }

    for (const key in changed) {
      if (key in this) {
        if (typeof this[key] === 'number' || typeof this[key] === 'string' || typeof this[key] === 'boolean') {
          if (key !== 'width' && key !== 'height') {
            this[key] = changed[key]
          }
        }
      }
    }
  }
}