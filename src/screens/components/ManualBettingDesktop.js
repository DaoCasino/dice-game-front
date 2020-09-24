import * as PIXI from 'pixi.js'

import Widget from '../../widgets/Widget'
import Button from '../../widgets/Button'
import Label from '../../widgets/Label'
import Rectangle from '../../widgets/Rectangle'
import SpinLog from './SpinLog'
import InputLabel from '../../widgets/InputLabel'
import Resources from '../../utils/Resources'
import { AppEvent } from '../../App'

export default class ManualBetting extends Widget {
  constructor(gameModel) {
    super({
      mask: {
        width: 0,
        height: 0,
      },
    })

    this.gameModel = gameModel

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
        text: 'ROLL',
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
      if (this.gameModel.get('autospinMode')) {
        if (this.gameModel.get('autospinEnabled')) {
          this.emit('rollstop')

        } else {
          this.emit('rollstart')
        }

      } else {
        this.emit('roll')
      }
    })

    this.rollButtonSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('dice_png')))
    this.rollButtonSprite.anchor.set(0.5)
    this.rollButtonSprite.scale.set(1)
    this.rollButtonSprite.visible = false

    this.maxBetButton = new Button({
      disable: true,
      background: {
        borderRadius: 10,
        gradientFrom: '#f29f36',
        gradientTo: '#e3891a',
        width: 110,
        height: 64,
      },
      label: {
        text: 'MAX\nROLL',
        fontFamily: 'Rajdhani Bold',
        fontSize: 28,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        lineHeight: 25,
      },
    })
    this.maxBetButton.on('pointerup', () => this.emit('betMax'))

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

    this.betValueLabel.on('focus', (value) => {
      this.rollButton.set('interactive', false)
      this.maxBetButton.set('interactive', false)
      this.betHalfButton.set('interactive', false)
      this.betDoubleButton.set('interactive', false)
      this.autospinButtons.forEach(button => button.set('interactive', false))
    })

    this.betValueLabel.on('blur', (value) => {
      this.rollButton.set('interactive', true)
      this.maxBetButton.set('interactive', true)
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

    this.payoutBackground = new Rectangle({
      fill: '0x000000',
      height: 40,
      borderRadius: 6,
      alpha: 0.2,
    })

    this.payoutLabel = new Label({
      text: 'PAYOUT ON WIN',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.4,
    })

    this.payoutValueSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('eos_png')))
    this.payoutValueSprite.anchor.set(0.5)
    this.payoutValueSprite.scale.set(1)

    this.payoutValueLabel = new Label({
      text: this.gameModel.get('bet') * this.gameModel.get('payout'),
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'right',
      anchor: {
        x: 1,
        y: 0.5,
      },
    })

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
      this.addChild(button)
    })

    this.gameModel.on('change:bet', (e) => {
      this.betValueLabel.set('text', this.gameModel.get('bet'))
      this.updateLabels()
      this.updateButtons()
    })

    this.gameModel.on('change:payout', (e) => {
      this.updateLabels()
    })

    this.gameModel.on('change:balance', () => {
      this.betValueLabel.set('max', Math.min(this.gameModel.get('betMax'), this.gameModel.get('balance')))
      this.updateButtons()
    })

    this.gameModel.on('change:connected', (e) => {
      if (e.changed.connected) {
        this.rollButton.set('disable', false)
        this.betValueLabel.set('disable', false)
        this.maxBetButton.set('disable', false)
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)

      } else {
        this.rollButton.set('disable', true)
        this.betValueLabel.set('disable', true)
        this.maxBetButton.set('disable', true)
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)
      }
    })

    this.eventBus = window.eventBus
    this.eventBus.on(AppEvent.SpinStart, () => {
      if (!this.gameModel.get('autospinMode')) {
        this.rollButton.set({
          disable: true,
          label: {
            visible: false,
          },
        })
        this.rollButtonSprite.visible = true
      }
    })

    const spinEnd = () => {
      if (!this.gameModel.get('autospinMode')) {
        this.rollButton.set({
          disable: false,
          label: {
            visible: true,
          },
        })
        this.rollButtonSprite.visible = false
      }
    }

    this.eventBus.on(AppEvent.SpinEnd, spinEnd)
    this.eventBus.on(AppEvent.SpinError, spinEnd)

    this.spinLog = new SpinLog()
    this.spinLog.on('proof', index => {
      this.emit('proof', this.gameModel.get('spinLog')[index])
    })

    this.addChild(this.rollButton)
    this.addChild(this.rollAutospinLabel)
    this.addChild(this.rollAutospinInfinity)
    this.addChild(this.autospinLabel)
    this.addChild(this.rollButtonSprite)
    this.addChild(this.maxBetButton)
    this.addChild(this.betBackground)
    this.addChild(this.betLabel)
    this.addChild(this.betValueSprite)
    this.addChild(this.betValueLabel)
    this.addChild(this.betHalfButton)
    this.addChild(this.betDoubleButton)
    this.addChild(this.payoutBackground)
    this.addChild(this.payoutLabel)
    this.addChild(this.payoutValueSprite)
    this.addChild(this.payoutValueLabel)
    this.addChild(this.spinLog)

    this.gameModel.on('change:autospinMode', (e) => {
      if (e.changed.autospinMode) {
        this.rollButton.set({
          label: {
            text: 'Start Autobet',
          },
        })

      } else {
        this.rollButton.set({
          label: {
            text: 'ROLL',
          },
        })
      }

      this.redraw()
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
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)

      } else {
        this.rollButton.set('disable', true)
        this.betValueLabel.set('disable', true)
        this.autospinButtons.forEach(button => button.set('disable', true))
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)
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
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)

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
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)
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

  updateLabels() {
    this.betValueLabel.set('text', this.gameModel.get('bet'))
    this.payoutValueLabel.set('text', this.gameModel.get('payout'))

    this.payoutValueSprite.position.set(
      this.payoutValueLabel.get('x') - this.payoutValueLabel.get('width') - 18,
      this.payoutValueLabel.get('y'),
    )
  }

  updateButtons() {
    const balance = this.gameModel.get('balance')
    const bet = this.gameModel.get('bet')

    if (bet > balance || balance === 0) {
      this.rollButton.set('disable', true)
      this.maxBetButton.set('disable', true)
    } else {
      this.rollButton.set('disable', false)
      this.maxBetButton.set('disable', false)
    }

  }

  update(dt) {
    if (this.spinLog.get('visible')) {
      this.spinLog.update(dt)
    }
  }

  redraw(changed) {
    this.spinLog.set({
      list: {
        width: this.get('width'),
        height: 40,
      },
      y: 25,
    })

    this.betLabel.set({
      y: 95,
    })

    this.betBackground.set({
      y: this.betLabel.get('y') + this.betLabel.get('height') / 2 + 8,
      width: this.get('width') * 0.5 - this.betHalfButton.get('width') - this.betDoubleButton.get('width') - 20,
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

    this.payoutBackground.set({
      visible: !this.gameModel.get('autospinMode'),
      x: this.get('width') - (this.get('width') / 2 - 30),
      y: this.betBackground.get('y'),
      width: this.get('width') / 2 - 30,
    })

    this.payoutLabel.set({
      visible: !this.gameModel.get('autospinMode'),
      x: this.payoutBackground.get('x') + 15,
      y: this.payoutBackground.get('y') + this.payoutBackground.get('height') / 2,
    })

    this.payoutValueLabel.set({
      visible: !this.gameModel.get('autospinMode'),
      x: this.payoutBackground.get('x') + this.payoutBackground.get('width') - 15,
      y: this.payoutBackground.get('y') + this.payoutBackground.get('height') / 2,
    })

    this.payoutValueSprite.position.set(
      this.payoutValueLabel.get('x') - this.payoutValueLabel.get('width') - 24,
      this.payoutValueLabel.get('y'),
    )
    this.payoutValueSprite.visible = !this.gameModel.get('autospinMode')

    this.rollButton.set({
      background: {
        width: this.gameModel.get('autospinMode') ? this.get('width') : this.get('width') * 0.75,
      },
      x: this.betBackground.get('x'),
      y: this.betBackground.get('y') + this.betBackground.get('height') / 2 + 45,
    })

    this.maxBetButton.set({
      visible: !this.gameModel.get('autospinMode'),
      x: this.rollButton.get('x') + this.rollButton.get('width') + 14,
      y: this.rollButton.get('y'),
      background: {
        width: this.get('width') * 0.25 - 14,
      },
    })

    this.rollAutospinLabel.set({
      x: this.rollButton.get('x') + this.rollButton.get('width') - 45,
      y: this.rollButton.get('y') + this.rollButton.get('height') / 2,
    })

    this.rollAutospinInfinity.x = this.rollButton.get('x') + this.rollButton.get('width') - 45
    this.rollAutospinInfinity.y = this.rollButton.get('y') + this.rollButton.get('height') / 2

    this.autospinLabel.set({
      visible: this.gameModel.get('autospinMode'),
      x: this.payoutBackground.get('x') + 15,
      y: this.betLabel.get('y'),
    })

    this.autospinButtons.forEach((button, value) => {
      const count = this.autospinButtons.length
      const margin = {
        x: 10,
        y: 10,
      }

      const width = (this.get('width') / 2 - 30 + margin.x) / count - margin.x

      button.set({
        visible: this.gameModel.get('autospinMode'),
        x: this.get('width') - (this.get('width') / 2 - 30) + value * (width + margin.x),
        y: this.betBackground.get('y'),
        background: {
          width: width,
        },
      })
    })

    this.rollButtonSprite.x = this.rollButton.get('x') + this.rollButton.get('width') / 2
    this.rollButtonSprite.y = this.rollButton.get('y') + this.rollButton.get('height') / 2

    super.redraw(changed)
  }
}