import * as PIXI from 'pixi.js'
import _ from 'underscore'

import { DropShadowFilter } from '@pixi/filter-drop-shadow'

import Button from '../../widgets/Button'
import Widget from '../../widgets/Widget'
import Label from '../../widgets/Label'
import Rectangle from '../../widgets/Rectangle'
import List from '../../widgets/List'
import InputLabel from '../../widgets/InputLabel'
import Circle from '../../widgets/Circle'
import { App } from '../../App'

class ChangeBetPanel extends Widget {
  constructor() {
    super({
      disable: true,
    })

    this.buttons = []

    this.background = new Rectangle({
      alpha: 0.4,
      height: 36,
      borderRadius: 18,
    })

    this.list = new List({
      type: 'horizontal',
      interaction: true,
      margin: {
        x: 0,
        y: 0,
      },
      mask: {
        enabled: false,
      },
    })

    this.addChild(this.background)
    this.addChild(this.list)

    const createButton = (text, callback) => {
      const button = new Button({
        disable: true,
        background: {
          borderRadius: 18,
          gradientFrom: '#5792f0',
          gradientTo: '#6e62e4',
          alpha: 0,
          width: 110,
          height: 36,
        },
        label: {
          text: text,
          fontFamily: 'Rajdhani',
          fontSize: 14,
          align: 'center',
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
      })
      button.on('pointerup', (e) => {
        if (callback) {
          callback(e)
        }
      })

      this.buttons.push(button)
      this.list.addItem(button)

      return button
    }

    this.leftButton = createButton('RESET', (e) => {
      this.setButtonActive(e.target)
      this.emit('change', 'reset')
    })

    this.middleButton = createButton('INCREASE BY', (e) => {
      this.setButtonActive(e.target)
      this.emit('change', 'increase')
    })

    this.rightButton = createButton('DECREASE BY', (e) => {
      this.setButtonActive(e.target)
      this.emit('change', 'decrease')
    })

    this.setButtonActive(this.leftButton)
  }

  setButtonActive(button) {
    for (let i = 0; i < this.buttons.length; i++) {
      const other = this.buttons[i]
      const style = other.get('background')

      style.alpha = 0

      other.set('background', style)
    }

    const style = button.get('background')

    style.alpha = 1

    button.set('background', style)

    this.activeButonIndex = this.buttons.indexOf(button)
  }

  setButtonActiveByIndex(index) {
    this.setButtonActive(this.buttons[index])
  }

  getButtonActiveIndex() {
    return this.activeButonIndex
  }

  redraw(changed) {
    this.background.set({
      width: this.get('width'),
    })

    this.buttons.forEach(other => {
      const style = other.get('background')

      style.width = this.get('width') / 3

      other.set('background', style)
    })

    if ('disable' in changed) {
      this.buttons.forEach(button => {
        button.set('disable', changed.disable)
      })
    }

    this.list.redraw()

    this.set({
      width: this.list.width,
      height: this.list.height,
    }, { silent: true })

    super.redraw(changed)
  }
}

class Checkbox extends Widget {
  constructor(props) {
    super(props)

    this.alpha = this.get('disable') ? 0.5 : 1
    this.buttonMode = !this.get('disable')
    this.interactive = !this.get('disable')

    this.background = new Rectangle({
      width: 59,
      height: 29,
      borderRadius: 14,
    })

    this.label = new Label({
      visible: true,
      fill: '0x1b1b45',
      fontFamily: 'Rajdhani',
      fontSize: 12,
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
    })

    this.box = new Circle({
      fill: 0xffffff,
      radius: 13,
    })

    this.shadow = new Circle({
      fill: 0xffffff,
      radius: 13,
    })
    this.shadow.filters = [new DropShadowFilter({
      distance: 1.5,
      angle: 45,
      alpha: 0.8,
      blur: 0.8,
    })]

    this.on('pointerdown', () => {
      this.set('active', !this.get('active'))
      this.emit('change', this.get('active'))
    })

    this.addChild(this.background)
    this.addChild(this.label)
    this.addChild(this.shadow)
    this.addChild(this.box)
  }

  redraw(changed) {
    if ('disable' in changed) {
      this.alpha = changed.disable ? 0.5 : 1
      this.buttonMode = !changed.disable
      this.interactive = !changed.disable
    }

    this.set({
      width: this.background.width,
      height: this.background.height,
    }, { silent: true })

    this.background.set({
      fill: !this.get('active') ? 0xff6f61 : 0x61ffb1,
    })

    this.label.set({
      text: this.get('active') ? 'ON' : 'OFF',
    })

    this.label.set({
      x: this.get('active') ? this.label.get('width') / 2 + 10 : this.get('width') - this.label.get('width') + 1,
      y: this.background.get('height') / 2,
    })

    this.shadow.set({
      x: !this.get('active') ? this.shadow.get('radius') / 2 + 2 : this.get('width') - this.shadow.get('radius') * 2 + 4,
      y: (this.background.get('height') - this.shadow.get('radius')) / 2,
    })

    this.box.set({
      x: !this.get('active') ? this.box.get('radius') / 2 + 2 : this.get('width') - this.box.get('radius') * 2 + 4,
      y: (this.background.get('height') - this.box.get('radius')) / 2,
    })

    super.redraw(changed)
  }
}

export default class AutoBettingDesktop extends Widget {
  constructor(props, gameModel) {
    super(_.deepExtend({
      list: {
        width: 0,
        height: 0,
      },
    }, props || {}))

    this.gameModel = gameModel

    this.background = new Rectangle({
      fill: '0x1b1b46',
    })
    this.addChild(this.background)

    this.list = new List({
      type: 'vertical',
      autoContentSize: false,
      margin: {
        x: 0,
        y: 0,
      },
      mask: {
        enabled: false,
      },
    })
    this.addChild(this.list)

    this.content = new PIXI.Container()
    this.list.addItem(this.content)

    this.label = new Label({
      visible: true,
      text: 'Autobet Mode',
      fontFamily: 'Rajdhani',
      fontSize: 23,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      y: 10,
    })

    this.checkbox = new Checkbox({
      disable: true,
      active: false,
    })
    this.checkbox.on('change', (value) => {
      this.gameModel.set('autospinMode', value)

      this.onLossPanel.set('disable', !value)
      this.onWinPanel.set('disable', !value)

      //if (this.gameModel.get('betOnWinAction') === 'reset') {
      //  this.onWinValueLabel.set('disable', true)

      //} else {
      this.onWinValueLabel.set('disable', !value)
      //}

      //if (this.gameModel.get('betOnLossAction') === 'reset') {
      //  this.onLossValueLabel.set('disable', true)

      //} else {
      this.onLossValueLabel.set('disable', !value)
      //}

      this.stopOnWinValueLabel.set('disable', !value)
      this.stopOnLossValueLabel.set('disable', !value)
    })

    this.onWinLabel = new Label({
      text: 'ON WIN',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.onWinPanel = new ChangeBetPanel()
    this.onWinPanel.on('change', action => {
      if (action === 'reset') {
        //this.onWinValueLabel.set('disable', true)
        this.gameModel.set('betOnWin', 0)

        this.onWinValueLabel.set('text', 0)
        this.onWinValueLabelPercent.set({
          x: this.onWinValueLabel.get('x') + (this.onWinValueLabel.getTextWidth()) + 5,
          y: this.onWinValueLabel.get('y'),
          visible: true,
        })

      } else {
        //this.onWinValueLabel.set('disable', false)
        this.gameModel.set('betOnWinAction', action)

        if (action === 'increase') {
          this.onWinValueLabel.set('max', this.gameModel.get('betOnWinIncreaseMax'))
          this.onWinValueLabel.set('maxLength', this.gameModel.get('betOnWinIncreaseMax').toString().length)

        } else if (action === 'decrease') {
          this.onWinValueLabel.set('max', this.gameModel.get('betOnWinDecreaseMax'))
          this.onWinValueLabel.set('maxLength', this.gameModel.get('betOnWinDecreaseMax').toString().length)
        }
      }
    })

    this.onWinValueBackground = new Rectangle({
      fill: '0x313354',
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.onWinValueLabel = new InputLabel({
      disable: true,
      type: 'number',
      min: 0,
      max: this.gameModel.get('betOnWinIncreaseMax'),
      maxLength: this.gameModel.get('betOnWinIncreaseMax').toString().length,
      placeholder: '',//'0.00%',
      text: '',
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      width: '160px',
      height: '40px',
    })

    this.onWinValueLabelPercent = new Label({
      visible: false,
      text: '%',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
    })

    this.onWinValueLabel.on('input', value => {
      if (value !== '' && this.onWinPanel.getButtonActiveIndex() === 0) {
        this.onWinPanel.setButtonActiveByIndex(1)
        this.gameModel.set('betOnWinAction', 'increase')
      }

      this.onWinValueLabelPercent.set({
        x: this.onWinValueLabel.get('x') + (this.onWinValueLabel.getTextWidth()) + 5,
        y: this.onWinValueLabel.get('y'),
        visible: this.onWinValueLabel.getTextWidth() < this.onWinValueLabel.get('width'),
      })
    })

    this.onWinValueLabel.on('focus', value => {
      if (value === '0') {
        this.onWinValueLabel.set('text', '')
      }

      this.onWinValueLabelPercent.set({
        x: this.onWinValueLabel.get('x') + (this.onWinValueLabel.getTextWidth()) + 5,
        y: this.onWinValueLabel.get('y'),
        visible: this.onWinValueLabel.getTextWidth() < this.onWinValueLabel.get('width'),
      })
    })

    this.onWinValueLabel.on('blur', value => {
      if (value !== '') {
        this.gameModel.set('betOnWin', parseFloat(value))

      } else {
        this.gameModel.set('betOnWin', 0)
      }

      console.log('blur', value)

      this.onWinValueLabelPercent.set({
        x: this.onWinValueLabel.get('x') + (this.onWinValueLabel.getTextWidth()) + 5,
        y: this.onWinValueLabel.get('y'),
        visible: this.onWinValueLabel.getTextWidth() < this.onWinValueLabel.get('width'),
      })
    })

    this.stopOnWinLabel = new Label({
      text: 'STOP ON PROFIT',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.stopOnWinValueBackground = new Rectangle({
      fill: '0x313354',
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.stopOnWinValueSprite = App.instance.currencyManager.createSprite('bet')
    this.stopOnWinValueSprite.anchor.set(0.5)

    this.stopOnWinValueLabel = new InputLabel({
      disable: true,
      type: 'number',
      min: 0,
      max: this.gameModel.get('betMax'),
      placeholder: '0',
      text: '',
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      width: '120px',
      height: '40px',
    })

    this.stopOnWinValueLabel.on('blur', value => {
      if (value !== '') {
        this.gameModel.set('stopOnWin', parseFloat(value))

      } else {
        this.gameModel.set('stopOnWin', 0)
      }
    })

    this.onLossLabel = new Label({
      text: 'ON LOSS',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.onLossPanel = new ChangeBetPanel()
    this.onLossPanel.on('change', action => {
      if (action === 'reset') {
        //this.onLossValueLabel.set('disable', true)
        this.gameModel.set('betOnLoss', 0)

        this.onLossValueLabel.set('text', 0)
        this.onLossValueLabelPercent.set({
          x: this.onLossValueLabel.get('x') + (this.onLossValueLabel.getTextWidth()) + 5,
          y: this.onLossValueLabel.get('y'),
          visible: true,
        })

      } else {
        //this.onLossValueLabel.set('disable', false)
        this.gameModel.set('betOnLossAction', action)

        if (action === 'increase') {
          this.onLossValueLabel.set('max', this.gameModel.get('betOnLossIncreaseMax'))
          this.onLossValueLabel.set('maxLength', this.gameModel.get('betOnLossIncreaseMax').toString().length)

        } else if (action === 'decrease') {
          this.onLossValueLabel.set('max', this.gameModel.get('betOnLossDecreaseMax'))
          this.onLossValueLabel.set('maxLength', this.gameModel.get('betOnLossDecreaseMax').toString().length)
        }
      }
    })

    this.onLossValueBackground = new Rectangle({
      fill: '0x313354',
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.onLossValueLabel = new InputLabel({
      disable: true,
      type: 'number',
      min: 0,
      max: this.gameModel.get('betOnLossIncreaseMax'),
      maxLength: this.gameModel.get('betOnLossIncreaseMax').toString().length,
      placeholder: '',//'0.00%',
      text: '',
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      width: '160px',
      height: '40px',
    })

    this.onLossValueLabelPercent = new Label({
      text: '%',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
    })

    this.onLossValueLabel.on('input', value => {
      if (value !== '' && this.onLossPanel.getButtonActiveIndex() === 0) {
        this.onLossPanel.setButtonActiveByIndex(1)
        this.gameModel.set('betOnLossAction', 'increase')
      }

      this.onLossValueLabelPercent.set({
        x: this.onLossValueLabel.get('x') + (this.onLossValueLabel.getTextWidth()) + 5,
        y: this.onLossValueLabel.get('y'),
        visible: this.onLossValueLabel.getTextWidth() < this.onLossValueLabel.get('width'),
      })
    })

    this.onLossValueLabel.on('focus', value => {
      if (value === '0') {
        this.onLossValueLabel.set('text', '')
      }

      this.onLossValueLabelPercent.set({
        x: this.onLossValueLabel.get('x') + (this.onLossValueLabel.getTextWidth()) + 5,
        y: this.onLossValueLabel.get('y'),
        visible: this.onLossValueLabel.getTextWidth() < this.onLossValueLabel.get('width'),
      })
    })

    this.onLossValueLabel.on('blur', value => {
      if (value !== '') {
        this.gameModel.set('betOnLoss', parseFloat(value))

      } else {
        this.gameModel.set('betOnLoss', 0)
      }

      this.onLossValueLabelPercent.set({
        x: this.onLossValueLabel.get('x') + (this.onLossValueLabel.getTextWidth()) + 5,
        y: this.onLossValueLabel.get('y'),
        visible: this.onLossValueLabel.getTextWidth() < this.onLossValueLabel.get('width'),
      })
    })

    this.onLossValueLabel.set('text', '0')

    this.stopOnLossLabel = new Label({
      text: 'STOP ON LOSS',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.stopOnLossValueSprite = App.instance.currencyManager.createSprite('bet')
    this.stopOnLossValueSprite.anchor.set(0.5)

    this.stopOnLossValueBackground = new Rectangle({
      fill: '0x313354',
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.stopOnLossValueLabel = new InputLabel({
      disable: true,
      type: 'number',
      min: 0,
      max: this.gameModel.get('betMax'),
      placeholder: '0',
      text: '',
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      width: '120px',
      height: '40px',
    })

    this.stopOnLossValueLabel.on('blur', value => {
      if (value !== '') {
        this.gameModel.set('stopOnLoss', parseFloat(value))

      } else {
        this.gameModel.set('stopOnLoss', 0)
      }
    })

    this.content.addChild(this.label)
    this.content.addChild(this.checkbox)

    this.content.addChild(this.onWinLabel)
    this.content.addChild(this.onWinPanel)
    this.content.addChild(this.onWinValueBackground)
    this.content.addChild(this.onWinValueLabel)
    this.content.addChild(this.onWinValueLabelPercent)

    this.content.addChild(this.onLossLabel)
    this.content.addChild(this.onLossPanel)
    this.content.addChild(this.onLossValueBackground)
    this.content.addChild(this.onLossValueLabel)
    this.content.addChild(this.onLossValueLabelPercent)

    this.content.addChild(this.stopOnWinLabel)
    this.content.addChild(this.stopOnWinValueBackground)
    this.content.addChild(this.stopOnWinValueSprite)
    this.content.addChild(this.stopOnWinValueLabel)

    this.content.addChild(this.stopOnLossLabel)
    this.content.addChild(this.stopOnLossValueBackground)
    this.content.addChild(this.stopOnLossValueSprite)
    this.content.addChild(this.stopOnLossValueLabel)

    this.gameModel.on('change:betOnWin', (e) => {
      const value = this.gameModel.get('betOnWin')

      this.onWinValueLabel.set('text', value === 0 ? '' : value)
    })

    this.gameModel.on('change:betOnLoss', (e) => {
      const value = this.gameModel.get('betOnLoss')

      this.onLossValueLabel.set('text', value === 0 ? '' : value)
    })

    this.gameModel.on('change:stopOnLoss', (e) => {
      const value = this.gameModel.get('stopOnLoss')

      this.stopOnLossValueLabel.set('text', value === 0 ? '' : value)
    })

    this.gameModel.on('change:stopOnWin', (e) => {
      const value = this.gameModel.get('stopOnWin')

      this.stopOnWinValueLabel.set('text', value === 0 ? '' : value)
    })

    this.gameModel.on('change:autospinEnabled', (e) => {
      const autospinEnabled = e.changed.autospinEnabled

      if (autospinEnabled) {
        this.checkbox.set('disable', true)

        if (this.gameModel.get('autospinMode')) {
          this.onLossPanel.set('disable', true)
          this.onWinPanel.set('disable', true)

          //if (this.gameModel.get('betOnWinAction') !== 'reset') {
          this.onWinValueLabel.set('disable', true)
          //}

          //if (this.gameModel.get('betOnLossAction') !== 'reset') {
          this.onLossValueLabel.set('disable', true)
          //}

          this.stopOnWinValueLabel.set('disable', true)
          this.stopOnLossValueLabel.set('disable', true)
        }

      } else {
        this.checkbox.set('disable', false)

        if (this.gameModel.get('autospinMode')) {
          this.onLossPanel.set('disable', false)
          this.onWinPanel.set('disable', false)

          //if (this.gameModel.get('betOnWinAction') !== 'reset') {
          this.onWinValueLabel.set('disable', false)
          //}

          //if (this.gameModel.get('betOnLossAction') !== 'reset') {
          this.onLossValueLabel.set('disable', false)
          //}

          this.stopOnWinValueLabel.set('disable', false)
          this.stopOnLossValueLabel.set('disable', false)
        }
      }
    })

    this.gameModel.on('change:connected', (e) => {
      if (e.changed.connected) {
        this.checkbox.set('disable', false)

        if (this.gameModel.get('autospinMode')) {
          this.onLossPanel.set('disable', false)
          this.onWinPanel.set('disable', false)

          //if (this.gameModel.get('betOnWinAction') !== 'reset') {
          this.onWinValueLabel.set('disable', false)
          //}

          //if (this.gameModel.get('betOnLossAction') !== 'reset') {
          this.onLossValueLabel.set('disable', false)
          //}

          this.stopOnWinValueLabel.set('disable', false)
          this.stopOnLossValueLabel.set('disable', false)
        }

      } else {
        this.checkbox.set('disable', true)

        if (this.gameModel.get('autospinMode')) {
          this.onLossPanel.set('disable', true)
          this.onWinPanel.set('disable', true)

          this.onWinValueLabel.set('disable', true)
          this.onLossValueLabel.set('disable', true)

          this.stopOnWinValueLabel.set('disable', true)
          this.stopOnLossValueLabel.set('disable', true)
        }
      }
    })

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('background' in changed) {
      this.background.set(changed.background)
    }

    if ('list' in changed) {
      this.list.set(changed.list)
    }

    this.list.set({
      width: this.get('width'),
      height: this.get('height'),
    })

    // FIXME
    this.list.set({
      contentSize: {
        width: this.background.get('width'),
        height: this.content.height,
      },
    }, { silent: true })
    //

    this.label.set({})
    this.checkbox.set({
      x: this.get('width') - this.checkbox.get('width'),
      y: this.label.get('y') - this.label.get('height') / 2,
    })

    //
    this.onWinLabel.set({
      y: this.label.get('y') + this.label.get('height') * 1.785,
    })

    this.onWinPanel.set({
      y: this.onWinLabel.get('y') + this.onWinLabel.get('height') + 3.5,
      width: this.get('width'),
    })

    this.onWinValueBackground.set({
      y: this.onWinPanel.get('y') + this.onWinPanel.get('height') + 18,
      width: this.get('width'),
    })

    this.onWinValueLabel.set({
      x: this.onWinValueBackground.get('x') + 15,
      y: this.onWinValueBackground.get('y') + this.onWinValueBackground.get('height') / 2,
      width: this.get('width') - 30,
    })

    this.onWinValueLabelPercent.set({
      x: this.onWinValueLabel.get('x') + (this.onWinValueLabel.getTextWidth()) + 5,
      y: this.onWinValueLabel.get('y'),
      visible: this.onWinValueLabel.get('text').length > 0 && this.onWinValueLabel.getTextWidth() < this.onWinValueLabel.get('width'),
    })

    this.onLossLabel.set({
      y: this.onWinValueBackground.get('y') + this.onWinValueBackground.get('height') + 25,
    })

    this.onLossPanel.set({
      y: this.onLossLabel.get('y') + this.onLossLabel.get('height') + 3.5,
      width: this.get('width'),
    })

    this.onLossValueBackground.set({
      y: this.onLossPanel.get('y') + this.onLossPanel.get('height') + 18,
      width: this.get('width'),
    })

    this.onLossValueLabel.set({
      x: this.onLossValueBackground.get('x') + 15,
      y: this.onLossValueBackground.get('y') + this.onLossValueBackground.get('height') / 2,
      width: this.get('width') - 30,
    })

    this.onLossValueLabelPercent.set({
      x: this.onLossValueLabel.get('x') + (this.onLossValueLabel.getTextWidth()) + 5,
      y: this.onLossValueLabel.get('y'),
      visible: this.onLossValueLabel.get('text').length > 0 && this.onLossValueLabel.getTextWidth() < this.onLossValueLabel.get('width'),
    })

    this.stopOnLossLabel.set({
      y: this.onLossValueBackground.get('y') + this.onLossValueBackground.get('height') + 25,
    })

    this.stopOnLossValueBackground.set({
      y: this.stopOnLossLabel.get('y') + this.stopOnLossLabel.get('height'),
      width: this.get('width'),
    })

    this.stopOnLossValueLabel.set({
      x: this.stopOnLossValueBackground.get('x') + 40,
      y: this.stopOnLossValueBackground.get('y') + this.stopOnLossValueBackground.get('height') / 2,
      width: this.get('width') - 55,
    })

    this.stopOnLossValueSprite.position.set(
      this.stopOnLossValueLabel.get('x') - 20,
      this.stopOnLossValueLabel.get('y'),
    )

    this.stopOnWinLabel.set({
      y: this.stopOnLossValueBackground.get('y') + this.stopOnLossValueBackground.get('height') + 25,
    })

    this.stopOnWinValueBackground.set({
      y: this.stopOnWinLabel.get('y') + this.stopOnWinLabel.get('height'),
      width: this.get('width'),
    })

    this.stopOnWinValueLabel.set({
      x: this.stopOnWinValueBackground.get('x') + 40,
      y: this.stopOnWinValueBackground.get('y') + this.stopOnWinValueBackground.get('height') / 2,
      width: this.get('width') - 55,
    })

    this.stopOnWinValueSprite.position.set(
      this.stopOnWinValueLabel.get('x') - 20,
      this.stopOnWinValueLabel.get('y'),
    )

    super.redraw(changed)
  }

  update(dt) {
    this.list.update(dt)
  }
}
