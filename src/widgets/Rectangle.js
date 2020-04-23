import _ from 'underscore'
import * as PIXI from 'pixi.js'

import Widget from './Widget'

export default class Rectangle extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      width: props && 'width' in props ? props.width : 100,
      height: props && 'height' in props ? props.height : 100,
      fill: props && 'fill' in props ? props.fill : 0x000000,
      gradientType: props && 'gradientType' in props ? props.gradientType : 'linear',
      gradientFrom: props && 'gradientFrom' in props ? props.gradientFrom : -1,
      gradientTo: props && 'gradientTo' in props ? props.gradientTo : -1,
      gradientFromRadius: props && 'gradientFromRadius' in props ? props.gradientFromRadius : -1,
      gradientToRadius: props && 'gradientToRadius' in props ? props.gradientToRadius : -1,
      borderRadius: props && 'borderRadius' in props ? props.borderRadius : 0,
      stroke: props && 'stroke' in props ? props.stroke : 0,
      strokeThickness: props && 'strokeThickness' in props ? props.strokeThickness : 0,
    }, props))

    this._shape = new PIXI.Graphics()
    this.addChild(this._shape)

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    this._shape.clear()

    if (this.get('width') > 0 && this.get('height') > 0) {
      if (this.model.get('gradientFrom') !== -1 && this.model.get('gradientTo') !== -1) {
        if (this.model.get('gradientType') === 'linear') {
          this._shape.beginTextureFill(Widget.linearGradient(
            this.model.get('gradientFrom'),
            this.model.get('gradientTo'),
            this.model.get('width'),
            this.model.get('height')))

        } else {
          this._shape.beginTextureFill(Widget.radialGradient(
            this.model.get('gradientFrom'),
            this.model.get('gradientTo'),
            this.model.get('gradientFromRadius'),
            this.model.get('gradientToRadius'),
            this.model.get('width'),
            this.model.get('height')))
        }

      } else {
        this._shape.beginFill(this.model.get('fill'))
      }

      if (this.model.get('strokeThickness') > 0) {
        this._shape.lineStyle(this.model.get('strokeThickness'), this.model.get('stroke'), 1)
      }

      if (this.model.get('borderRadius') > 0) {
        this._shape.drawRoundedRect(0, 0, this.model.get('width'), this.model.get('height'), this.model.get('borderRadius'))

      } else {
        this._shape.drawRect(0, 0, this.model.get('width'), this.model.get('height'))
      }

      this._shape.endFill()
    }

    /*
    this.set({
      width: this._shape.width,
      height: this._shape.height,
    }, { silent: true })
     */

    super.redraw(changed)
  }

  get shape() {
    return this._shape
  }
}
