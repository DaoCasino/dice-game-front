import * as PIXI from 'pixi.js'
import _ from 'underscore'

import Widget from './Widget'
import Rectangle from './Rectangle'
import Utils from '../utils/Utils'
import Label from './Label'
import Resources from '../utils/Resources'

class Step extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      line: {
        fill: '0xffffff',
        length: 10,
        thickness: 1,
        alpha: 0.3,
      },
      label: {
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        fill: '0xffffff',
        fontFamily: 'Rajdhani',
        fontSize: 11,
        alpha: 0.5,
        y: -8,
      },
    }, props || {}))

    this.line = new Rectangle(this.get('line'))
    this.label = new Label(this.get('label'))

    this.addChild(this.line)
    this.addChild(this.label)

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('label' in changed) {
      this.label.set(changed.label)
    }

    if ('line' in changed) {
      this.line.set(changed.line)

      this.line.set({
        width: this.get('line').thickness,
        height: this.get('line').length,
      })
    }

    super.redraw(changed)
  }
}

export default class Slider extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      width: 0,
      height: 0,
      value: 50,
      min: 0,
      max: 100,
      backgroundLeft: {
        fill: '0xff6f61',
        borderRadius: 8,
      },
      backgroundRight: {
        fill: '0x00ff00',
        borderRadius: 8,
      },
      patternRightMask: {
        fill: '0x000000',
        borderRadius: 8,
      },
      handle: {
        fill: '0xffffff',
        borderRadius: 10,
        width: 44,
        height: 44,
      },
      handleLabel: {
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        fill: '0x121224',
        fontFamily: 'Rajdhani',
        fontSize: 20,
      },
      showSteps: false,
      steps: 5,
      stepping: false,
    }, props || {}))

    this.draggingData = null
    this.dragging = false

    this.backgroundLeft = new Rectangle()
    this.backgroundRight = new Rectangle()

    this.patternRightMask = new Rectangle(this.get('patternRightMask'))

    this.patternRight = new PIXI.TilingSprite(new PIXI.Texture.from(Resources.get('pattern_png')))
    this.patternRight.anchor.set(1, 0)
    this.patternRight.mask = this.patternRightMask

    this.handle = new Rectangle()
    this.handle.buttonMode = true
    this.handle.interactive = true

    this.handle.on('pointerdown', (e) => {
      this.draggingData = e.data
      this.dragging = true
    })
    this.handle.on('pointermove', (e) => {
      if (this.dragging) {
        const globalPosition = this.draggingData.global
        const local = this.toLocal(globalPosition)

        const width = this.get('width')
        const handleWidth = this.get('handle').width

        const min = handleWidth / 2
        const max = width - handleWidth / 2

        const x = Math.max(handleWidth / 2, Math.min(width - handleWidth / 2, local.x))

        let value = Utils.remap(x, min, max, this.get('min'), this.get('max'))

        if (this.get('stepping')) {
          value = Math.round(value)
        }

        this.set('value', value)
        this.emit('change', value)
      }
    })
    this.handle.on('pointerup', () => {
      this.draggingData = null
      this.dragging = false
    })
    this.handle.on('pointerupoutside', () => {
      this.draggingData = null
      this.dragging = false
    })

    this.handleLabel = new Label()

    this.addChild(this.backgroundLeft)
    this.addChild(this.backgroundRight)
    this.addChild(this.patternRight)
    this.addChild(this.patternRightMask)
    this.addChild(this.handle)
    this.addChild(this.handleLabel)

    this.steps = []

    this.redraw()
  }

  showSteps(value) {
    const steps = this.get('steps')

    for (let i = 0; i < this.steps.length; i++) {
      this.removeChild(this.steps[i])
    }

    this.steps = []

    if (value) {
      for (let i = 0; i < steps; i++) {
        const percent = (100 / (steps - 1)) * i
        const step = new Step({
          x: Utils.remap(percent, 0, 100, 0, this.get('width')),
          y: -6,
          label: {
            text: percent,
          },
        })

        this.steps.push(step)
        this.addChild(step)
      }
    }
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    const width = this.get('width')
    const height = this.get('height')

    const handleWidth = this.get('handle').width
    const handleHeight = this.get('handle').height

    const value = this.get('value')

    const maxHeight = Math.max(height, handleHeight)

    const leftWidth = Utils.remap(value, this.get('min'), this.get('max'), handleWidth / 2, width - handleWidth / 2)
    const rightWidth = width - leftWidth

    this.backgroundLeft.set({
      y: (maxHeight - height) / 2,
      width: leftWidth,
      height: height,
    })

    if ('backgroundLeft' in changed) {
      this.backgroundLeft.set(changed.backgroundLeft)
    }

    this.backgroundRight.set({
      x: leftWidth,
      y: Math.abs((height - handleHeight) / 2),
      width: rightWidth,
      height: height,
    })

    if ('backgroundRight' in changed) {
      this.backgroundRight.set(changed.backgroundRight)
    }

    this.patternRightMask.set({
      x: leftWidth,
      y: Math.abs((height - handleHeight) / 2),
      width: rightWidth,
      height: height,
    })

    this.patternRight.x = this.backgroundRight.get('x') + this.backgroundRight.get('width')
    this.patternRight.y = Math.abs((height - handleHeight) / 2)
    this.patternRight.width = rightWidth
    this.patternRight.height = height
    this.patternRight.tilePosition.x = rightWidth

    this.handle.set({
      x: Utils.remap(value, this.get('min'), this.get('max'), 0, width - handleWidth),
    })

    if ('handle' in changed) {
      this.handle.set(changed.handle)
    }

    if ('handleLabel' in changed) {
      this.handleLabel.set(changed.handleLabel)
    }

    this.handleLabel.set({
      text: Math.floor(value),
      x: this.handle.get('x') + this.handle.width / 2,
      y: this.handle.get('y') + this.handle.height / 2,
    })

    if ('showSteps' in changed || 'steps' in changed || 'width' in changed || 'height' in changed) {
      this.showSteps(this.get('showSteps'))
    }

    super.redraw(changed)
  }
}
