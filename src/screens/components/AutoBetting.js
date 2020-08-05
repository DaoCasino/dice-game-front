import * as PIXI from 'pixi.js'
import { isMobile } from 'mobile-device-detect'

import Button from '../../widgets/Button'
import Label from '../../widgets/Label'
import Rectangle from '../../widgets/Rectangle'
import SpinLog from './SpinLog'
import List from '../../widgets/List'
import Widget from '../../widgets/Widget'
import InputLabel from '../../widgets/InputLabel'
import Resources from '../../utils/Resources'

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
          fontSize: 16,
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

export default class AutoBetting extends Widget {
  constructor(gameModel) {
    super({})

    this.gameModel = gameModel

    this.list = new List({
      type: 'vertical',
      autoContentSize: false,
      margin: {
        x: 0,
        y: 0,
      },
      mask: {
        enabled: true,
      },
    })
    this.addChild(this.list)

    this.content = new PIXI.Container()
    this.list.addItem(this.content)

    this.rollButton = new Button({
      disable: true,
      background: {
        borderRadius: 10,
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
        width: 235,
        height: 64,
      },
      label: {
        text: 'Start Autobet',
        fontFamily: 'Rajdhani Bold',
        fontSize: 28,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      },
    })

    this.rollButton.on('pointerup', () => {
      if (this.gameModel.get('autospinEnabled')) {
        this.emit('rollstop')

      } else {
        this.emit('rollstart')
      }
    })

    this.rollAutospinLabel = new Label({
      text: '',
      fontFamily: 'Rajdhani Bold',
      fontSize: 28,
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
    })

    this.rollAutospinInfinity = new PIXI.Sprite(PIXI.Texture.from(Resources.get('infinity_png')))
    this.rollAutospinInfinity.anchor.set(0.5)
    this.rollAutospinInfinity.scale.set(1)
    this.rollAutospinInfinity.visible = false

    this.betBackground = new Rectangle({
      fill: '0x313354',
      width: this.rollButton.get('width'),
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.betLabel = new Label({
      text: 'BET AMOUNT',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.betValueSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('eos_png')))
    this.betValueSprite.anchor.set(0.5)
    this.betValueSprite.scale.set(1)

    this.betValueLabel = new InputLabel({
      disable: true,
      type: 'number',
      min: this.gameModel.get('betMin'),
      max: this.gameModel.get('betMax'),
      placeholder: 'Enter your bet',
      text: this.gameModel.get('bet'),
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

    /*
       this.betValueLabel.on('input', value => {
         if (value !== '') {
           const bet = parseFloat(parseFloat(value).toFixed(4))
           const balance = this.gameModel.get('balance')

           if (!isNaN(bet)) {
             this.gameModel.set('bet', Math.min(balance, bet))
           }
         }
       })
        */

    this.betValueLabel.on('focus', (value) => {
      this.rollButton.set('interactive', false)
      this.onLossPanel.set('interactive', false)
      this.onWinPanel.set('interactive', false)
      this.betHalfButton.set('interactive', false)
      this.betDoubleButton.set('interactive', false)
      this.autospinButtons.forEach(button => button.set('interactive', false))
    })

    this.betValueLabel.on('blur', (value) => {
      this.rollButton.set('interactive', true)
      this.onLossPanel.set('interactive', true)
      this.onWinPanel.set('interactive', true)
      this.betHalfButton.set('interactive', true)
      this.betDoubleButton.set('interactive', true)
      this.autospinButtons.forEach(button => button.set('interactive', true))

      if (value !== '') {
        const bet = parseFloat(parseFloat(value).toFixed(4))

        if (!isNaN(bet)) {
          this.gameModel.set('bet', bet)
        }
      }
    })

    this.betHalfButton = new Button({
      disable: true,
      background: {
        borderRadius: 6,
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
        width: 40,
        height: 40,
      },
      label: {
        text: '1 / 2',
        fontFamily: 'Rajdhani',
        fontSize: 16,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      },
    })
    this.betHalfButton.on('pointerup', () => this.emit('betHalf'))

    this.betDoubleButton = new Button({
      disable: true,
      background: {
        borderRadius: 6,
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
        width: 40,
        height: 40,
      },
      label: {
        text: '2x',
        fontFamily: 'Rajdhani',
        fontSize: 16,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      },
    })
    this.betDoubleButton.on('pointerup', () => this.emit('betDouble'))

    this.autospinLabel = new Label({
      text: 'NUMBER OF BETS',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.spinLog = new SpinLog()
    this.spinLog.on('proof', index => {
      this.emit('proof', this.gameModel.get('spinLog')[index])
    })

    this.content.addChild(this.rollButton)
    this.content.addChild(this.rollAutospinLabel)
    this.content.addChild(this.rollAutospinInfinity)
    this.content.addChild(this.betBackground)
    this.content.addChild(this.betLabel)
    this.content.addChild(this.betValueLabel)
    this.content.addChild(this.betValueSprite)
    this.content.addChild(this.betHalfButton)
    this.content.addChild(this.betDoubleButton)
    this.content.addChild(this.autospinLabel)
    this.content.addChild(this.spinLog)

    this.autospinButtons = []
    this.autospinVariations = this.gameModel.get('autospinVariations')

    this.autospinVariations.forEach(value => {
      const button = new Button({
        disable: true,
        background: {
          borderRadius: 20,
          fill: '#000000',
          alpha: 0.4,
          width: 60,
          height: 40,
        },
        label: {
          text: value === -1 ? '' : value,
          fontFamily: 'Rajdhani',
          fontSize: 16,
          align: 'center',
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
      })
      button.on('pointerup', (e) => {
        this.setAutoSpin(this.autospinButtons.indexOf(e.target))
      })

      if (value === -1) {
        const infinity = new PIXI.Sprite(PIXI.Texture.from(Resources.get('infinity_png')))

        infinity.anchor.set(0.5)
        infinity.scale.set(1)

        button.label.addChild(infinity)
      }

      this.autospinButtons.push(button)
      this.content.addChild(button)
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
      }

      if (action === 'increase') {
        this.onWinValueLabel.set('max', this.gameModel.get('betOnWinIncreaseMax'))
        this.onWinValueLabel.set('maxLength', this.gameModel.get('betOnWinIncreaseMax').toString().length)

      } else if (action === 'decrease') {
        this.onWinValueLabel.set('max', this.gameModel.get('betOnWinDecreaseMax'))
        this.onWinValueLabel.set('maxLength', this.gameModel.get('betOnWinDecreaseMax').toString().length)
      }
    })

    this.onWinValueBackground = new Rectangle({
      fill: '0x313354',
      width: this.rollButton.get('width'),
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.onWinValueLabel = new InputLabel({
      //disable: true,
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
      width: this.rollButton.get('width'),
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.stopOnWinValueSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('eos_png')))
    this.stopOnWinValueSprite.anchor.set(0.5)
    this.stopOnWinValueSprite.scale.set(1)

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
      width: '160px',
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
      }

      if (action === 'increase') {
        this.onLossValueLabel.set('max', this.gameModel.get('betOnLossIncreaseMax'))
        this.onLossValueLabel.set('maxLength', this.gameModel.get('betOnLossIncreaseMax').toString().length)

      } else if (action === 'decrease') {
        this.onLossValueLabel.set('max', this.gameModel.get('betOnLossDecreaseMax'))
        this.onLossValueLabel.set('maxLength', this.gameModel.get('betOnLossDecreaseMax').toString().length)
      }
    })

    this.onLossValueBackground = new Rectangle({
      fill: '0x313354',
      width: this.rollButton.get('width'),
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

    this.stopOnLossValueBackground = new Rectangle({
      fill: '0x313354',
      width: this.rollButton.get('width'),
      height: 40,
      borderRadius: 6,
      stroke: 0x53537b,
      strokeThickness: 1,
    })

    this.stopOnLossValueSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('eos_png')))
    this.stopOnLossValueSprite.anchor.set(0.5)
    this.stopOnLossValueSprite.scale.set(1)

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
      width: '160px',
      height: '40px',
    })

    this.stopOnLossValueLabel.on('blur', value => {
      if (value !== '') {
        this.gameModel.set('stopOnLoss', parseFloat(value))

      } else {
        this.gameModel.set('stopOnLoss', 0)
      }
    })

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

    this.gameModel.on('change:bet', (e) => {
      this.betValueLabel.set('text', this.gameModel.get('bet'))
    })

    this.gameModel.on('change:chance', (e) => {
      this.betValueLabel.set('text', this.gameModel.get('bet'))
    })

    this.gameModel.on('change:balance', () => {
      this.betValueLabel.set('max', Math.min(this.gameModel.get('betMax'), this.gameModel.get('balance')))
    })

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

    this.gameModel.on('change:autospin', () => {
      if (this.gameModel.get('autospinEnabled')) {
        this.rollButton.set({
          label: {
            text: 'Stop Autobet',
          },
        })

        this.rollAutospinLabel.set('text', this.gameModel.get('autospin'))

        if (this.gameModel.get('autospin') > 0) {
          this.rollAutospinLabel.visible = true
          this.rollAutospinInfinity.visible = false
        }

      } else {
        this.rollAutospinLabel.visible = false
        this.rollAutospinInfinity.visible = false
      }
    })

    this.gameModel.on('change:connected', (e) => {
      if (e.changed.connected) {
        this.rollButton.set('disable', false)
        this.betValueLabel.set('disable', false)
        this.autospinButtons.forEach(button => button.set('disable', false))
        this.onLossPanel.set('disable', false)
        this.onWinPanel.set('disable', false)
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)

        //if (this.gameModel.get('betOnWinAction') !== 'reset') {
        this.onWinValueLabel.set('disable', false)
        //}

        //if (this.gameModel.get('betOnLossAction') !== 'reset') {
        this.onLossValueLabel.set('disable', false)
        //}

        this.stopOnWinValueLabel.set('disable', false)
        this.stopOnLossValueLabel.set('disable', false)

      } else {
        this.rollButton.set('disable', true)
        this.betValueLabel.set('disable', true)
        this.autospinButtons.forEach(button => button.set('disable', true))
        this.onLossPanel.set('disable', true)
        this.onWinPanel.set('disable', true)
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)

        //if (this.gameModel.get('betOnWinAction') !== 'reset') {
        this.onWinValueLabel.set('disable', true)
        //}

        //if (this.gameModel.get('betOnLossAction') !== 'reset') {
        this.onLossValueLabel.set('disable', true)
        //}

        this.stopOnWinValueLabel.set('disable', true)
        this.stopOnLossValueLabel.set('disable', true)
      }
    })

    this.gameModel.on('change:autospinEnabled', (e) => {
      const autospinEnabled = e.changed.autospinEnabled

      if (autospinEnabled) {
        this.rollButton.set({
          background: {
            gradientFrom: '#eb386e',
            gradientTo: '#e44141',
          },
          label: {
            align: 'left',
            anchor: {
              x: 0,
              y: 0.5,
            },
            text: 'Stop Autobet',
            margin: {
              x: 20,
              y: 0,
            },
          },
        })

        this.rollAutospinLabel.set('text', this.gameModel.get('autospin'))

        if (this.gameModel.get('autospin') === -1) {
          this.rollAutospinLabel.visible = false
          this.rollAutospinInfinity.visible = true

        } else {
          this.rollAutospinLabel.visible = true
          this.rollAutospinInfinity.visible = false
        }

        this.autospinButtons.forEach(button => button.set('disable', true))
        this.betValueLabel.set('disable', true)
        this.onLossPanel.set('disable', true)
        this.onWinPanel.set('disable', true)
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)

        //if (this.gameModel.get('betOnWinAction') !== 'reset') {
        this.onWinValueLabel.set('disable', true)
        //}

        //if (this.gameModel.get('betOnLossAction') !== 'reset') {
        this.onLossValueLabel.set('disable', true)
        //}

        this.stopOnWinValueLabel.set('disable', true)
        this.stopOnLossValueLabel.set('disable', true)

      } else {
        this.rollButton.set({
          disable: false,
          background: {
            gradientFrom: '#5792f0',
            gradientTo: '#6e62e4',
          },
          label: {
            align: 'center',
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            text: 'Start Autobet',
            margin: {
              x: 0,
              y: 0,
            },
          },
        })

        this.rollAutospinLabel.visible = false
        this.rollAutospinInfinity.visible = false

        this.autospinButtons.forEach(button => button.set('disable', false))
        this.betValueLabel.set('disable', false)
        this.onLossPanel.set('disable', false)
        this.onWinPanel.set('disable', false)
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)

        //if (this.gameModel.get('betOnWinAction') !== 'reset') {
        this.onWinValueLabel.set('disable', false)
        //}

        //if (this.gameModel.get('betOnLossAction') !== 'reset') {
        this.onLossValueLabel.set('disable', false)
        //}

        this.stopOnWinValueLabel.set('disable', false)
        this.stopOnLossValueLabel.set('disable', false)
      }
    })

    this.setAutoSpin(0)
  }

  setAutoSpin(index) {
    const button = this.autospinButtons[index]

    this.autospinButtons.forEach(button => {
      button.set({
        background: {
          gradientFrom: -1,
          gradientTo: -1,
          fill: '#000000',
          alpha: 0.4,
        },
      })
    })

    button.set({
      background: {
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
        alpha: 1,
      },
    })

    this.gameModel.set('autospinVariationIndex', index)

    this.emit('autospin', this.gameModel.get('autospinVariations')[index])
  }

  update(dt) {
    this.list.update(dt)

    if (this.spinLog.get('visible')) {
      this.spinLog.update(dt)
    }
  }

  redraw(changed) {
    this.list.set({
      width: this.get('width'),
      height: this.get('height'),
    })

    // FIXME
    this.list.set({
      contentSize: {
        width: this.get('width'),
        height: this.content.height + 60,
      },
    }, { silent: true })

    let spinLogVisible = true
    let initialY = 80

    // iPhone 5 + SE
    if (window.app.currHeight <= 568) {
      spinLogVisible = false
      initialY = 30
    }

    this.spinLog.set({
      visible: spinLogVisible,
      list: {
        width: this.get('width'),
        height: 40,
      },
      y: 22.5,
    })

    this.rollButton.set({
      background: {
        width: this.get('width'),
      },
      y: initialY,
    })

    this.rollAutospinLabel.set({
      x: this.rollButton.get('x') + this.rollButton.get('width') - 45,
      y: this.rollButton.get('y') + this.rollButton.get('height') / 2,
    })

    this.rollAutospinInfinity.x = this.rollButton.get('x') + this.rollButton.get('width') - 45
    this.rollAutospinInfinity.y = this.rollButton.get('y') + this.rollButton.get('height') / 2

    this.betLabel.set({
      y: this.rollButton.get('y') + this.rollButton.get('height') + 25,
    })

    this.betBackground.set({
      y: this.betLabel.get('y') + this.betLabel.get('height') / 2 + 8,
      width: this.get('width') - this.betHalfButton.get('width') - this.betDoubleButton.get('width') - 20,
    })

    this.betValueLabel.set({
      x: this.betBackground.get('x') + 40,
      y: this.betBackground.get('y') + this.betBackground.get('height') / 2,
      width: (this.betBackground.get('width') - 55),
    })

    this.betValueSprite.position.set(
      this.betValueLabel.get('x') - 20,
      this.betValueLabel.get('y'),
    )

    this.betHalfButton.set({
      x: this.betBackground.get('width') + 15,
      y: this.betLabel.get('y') + this.betLabel.get('height') / 2 + 8,
    })

    this.betDoubleButton.set({
      x: this.betHalfButton.get('x') + this.betHalfButton.get('width') + 5,
      y: this.betHalfButton.get('y'),
    })

    this.autospinLabel.set({
      y: this.betBackground.get('y') + this.betBackground.get('height') + 25,
    })

    this.autospinButtons.forEach((button, value) => {
      const count = this.autospinButtons.length
      const margin = {
        x: 10,
        y: 10,
      }

      const width = (this.get('width') + margin.x) / count - margin.x

      button.set({
        x: value * (width + margin.x),
        y: this.autospinLabel.get('y') + this.autospinLabel.get('height') / 2 + 8,
        background: {
          width: width,
        },
      })
    })

    this.onWinLabel.set({
      y: this.autospinLabel.get('y') + this.autospinLabel.get('height') + 25 * 2.5,
      visible: isMobile,
    })

    this.onWinPanel.set({
      y: this.onWinLabel.get('y') + this.onWinLabel.get('height') + 3.5,
      width: this.get('width'),
      visible: isMobile,
    })

    this.onWinValueBackground.set({
      y: this.onWinPanel.get('y') + this.onWinPanel.get('height') + 18,
      width: this.get('width'),
      visible: isMobile,
    })

    this.onWinValueLabel.set({
      x: this.onWinValueBackground.get('x') + 15,
      y: this.onWinValueBackground.get('y') + this.onWinValueBackground.get('height') / 2,
      width: this.get('width') - 30,
      visible: isMobile,
    })

    this.onLossLabel.set({
      y: this.onWinValueBackground.get('y') + this.onWinValueBackground.get('height') + 25,
      visible: isMobile,
    })

    this.onLossPanel.set({
      y: this.onLossLabel.get('y') + this.onLossLabel.get('height') + 3.5,
      width: this.get('width'),
      visible: isMobile,
    })

    this.onLossValueBackground.set({
      y: this.onLossPanel.get('y') + this.onLossPanel.get('height') + 18,
      width: this.get('width'),
      visible: isMobile,
    })

    this.onLossValueLabel.set({
      x: this.onLossValueBackground.get('x') + 15,
      y: this.onLossValueBackground.get('y') + this.onLossValueBackground.get('height') / 2,
      width: this.get('width') - 30,
      visible: isMobile,
    })

    this.stopOnWinLabel.set({
      y: this.onLossValueBackground.get('y') + this.onLossValueBackground.get('height') + 25,
      visible: isMobile,
    })

    this.stopOnWinValueBackground.set({
      y: this.stopOnWinLabel.get('y') + this.stopOnWinLabel.get('height'),
      width: this.get('width'),
      visible: isMobile,
    })

    this.stopOnWinValueLabel.set({
      x: this.stopOnWinValueBackground.get('x') + 40,
      y: this.stopOnWinValueBackground.get('y') + this.stopOnWinValueBackground.get('height') / 2,
      width: this.get('width') - 55,
      visible: isMobile,
    })

    this.stopOnWinValueSprite.position.set(
      this.stopOnWinValueLabel.get('x') - 20,
      this.stopOnWinValueLabel.get('y'),
    )

    this.stopOnLossLabel.set({
      y: this.stopOnWinValueBackground.get('y') + this.stopOnWinValueBackground.get('height') + 25,
      visible: isMobile,
    })

    this.stopOnLossValueBackground.set({
      y: this.stopOnLossLabel.get('y') + this.stopOnLossLabel.get('height'),
      width: this.get('width'),
      visible: isMobile,
    })

    this.stopOnLossValueLabel.set({
      x: this.stopOnLossValueBackground.get('x') + 40,
      y: this.stopOnLossValueBackground.get('y') + this.stopOnLossValueBackground.get('height') / 2,
      width: this.get('width') - 55,
      visible: isMobile,
    })

    this.stopOnLossValueSprite.position.set(
      this.stopOnLossValueLabel.get('x') - 20,
      this.stopOnLossValueLabel.get('y'),
    )

    super.redraw(changed)
  }
}