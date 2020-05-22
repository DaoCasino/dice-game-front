import _ from 'underscore'

import Widget from './Widget'
import Label from './Label'
import Rectangle from './Rectangle'
import Circle from './Circle'

export default class Button extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      disable: false,
      text: 'Button',
      background: {
        type: 'rectangle',// rectangle | circle
        width: 100,
        height: 100,
        radius: 100,
        fill: '0xffffff',
        gradientType: 'linear',
        gradientFrom: -1,
        gradientTo: -1,
        gradientFromRadius: -1,
        gradientToRadius: -1,
        borderRadius: 0,
        stroke: 0,
        strokeThickness: 0,
      },
      label: {
        text: 'Button',
        fill: '0xffffff',
        stroke: 0,
        strokeThickness: 0,
        fontFamily: '',
        fontSize: 16,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        margin: {
          x: 0,
          y: 0,
        },
      },
    }, props || {}))

    if (this.get('background').type === 'circle') {
      this.background = new Circle(this.get('background'))

    } else if (this.get('background').type === 'rectangle') {
      this.background = new Rectangle(this.get('background'))
    }

    this.label = new Label(this.get('label'))

    this.addChild(this.background)
    this.addChild(this.label)

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    super.redraw(changed)

    if ('text' in changed) {
      this.label.set('text', changed.text)
    }

    if ('background' in changed) {
      if ('type' in changed.background) {
        const newType = changed.background.type

        if (newType === 'circle' && this.background instanceof Rectangle) {
          this.removeChild(this.background)

          this.background = new Circle(this.get('background'))
          this.addChildAt(this.label, 0)

        } else if (newType === 'rectangle' && this.background instanceof Circle) {
          this.removeChild(this.background)

          this.background = new Rectangle(this.get('background'))
          this.addChildAt(this.label, 0)
        }
      }

      this.background.set(changed.background)
    }

    if ('label' in changed) {
      this.label.set(changed.label)
    }

    if ('disable' in changed) {
      if (changed.disable) {
        this.alpha = 0.5
        this.interactive = false
        this.buttonMode = false

      } else {
        this.alpha = 1
        this.interactive = true
        this.buttonMode = true
      }
    }

    if (this.get('background').type === 'rectangle') {
      if (this.label.get('align') === 'center') {
        this.label.set({
          x: this.background.get('width') / 2 + this.label.get('margin').x,
          y: this.background.get('height') / 2 + this.label.get('margin').y,
        })

      } else if (this.label.get('align') === 'left') {
        this.label.set({
          x: this.label.get('margin').x,
          y: this.background.get('height') / 2 + this.label.get('margin').y,
        })

      } else if (this.label.get('align') === 'right') {
        this.label.set({
          x: this.background.get('width') + this.label.get('margin').x,
          y: this.background.get('height') / 2 + this.label.get('margin').y,
        })
      }

    } else if (this.get('background').type === 'circle') {
      this.label.set({
        x: this.background.get('radius') / 2,
        y: this.background.get('radius') / 2,
      })
    }

    this.set({
      width: this.background.width,
      height: this.background.height,
    }, { silent: true })
  }
}
