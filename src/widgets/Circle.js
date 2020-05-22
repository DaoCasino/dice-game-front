import _ from 'underscore'
import * as PIXI from 'pixi.js'

import Widget from './Widget'

export default class Circle extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      radius: props && 'radius' in props ? props.radius : 100,
      fill: props && 'fill' in props ? props.fill : 0x000000,
      gradientType: props && 'gradientType' in props ? props.gradientType : 'linear',
      gradientFrom: props && 'gradientFrom' in props ? props.gradientFrom : -1,
      gradientTo: props && 'gradientTo' in props ? props.gradientTo : -1,
      gradientFromRadius: props && 'gradientFromRadius' in props ? props.gradientFromRadius : -1,
      gradientToRadius: props && 'gradientToRadius' in props ? props.gradientToRadius : -1,
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

    if (this.get('radius') > 0) {
      if (this.model.get('gradientFrom') !== -1 && this.model.get('gradientTo') !== -1) {
        if (this.model.get('gradientType') === 'linear') {
          this._shape.beginTextureFill(Widget.linearGradient(
            this.model.get('gradientFrom'),
            this.model.get('gradientTo'),
            this.model.get('radius'),
            this.model.get('radius')))

        } else {
          this._shape.beginTextureFill(Widget.radialGradient(
            this.model.get('gradientFrom'),
            this.model.get('gradientTo'),
            this.model.get('gradientFromRadius'),
            this.model.get('gradientToRadius'),
            this.model.get('radius'),
            this.model.get('radius')))
        }

      } else {
        this._shape.beginFill(this.model.get('fill'))
      }

      this._shape.drawCircle(this.model.get('radius') / 2, this.model.get('radius') / 2, this.model.get('radius'))

      if (this.model.get('strokeThickness') > 0) {
        this._shape.lineStyle(this.model.get('strokeThickness'), this.model.get('stroke'))
      }

      this._shape.endFill()
    }

    this.set({
      width: this._shape.width,
      height: this._shape.height,
    }, { silent: true })

    super.redraw(changed)
  }

  get shape() {
    return this._shape
  }
}
