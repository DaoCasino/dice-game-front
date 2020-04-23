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
    this.rollButton.on('pointerup', () => this.emit('roll'))

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

    this.depositOrWithdrawButton = new Button({
      visible: process.env.BUILD_MODE === 'development',
      background: {
        borderRadius: 6,
        gradientFrom: '#f29f36',
        gradientTo: '#e3891a',
        width: 84,
        height: 28,
      },
      label: {
        text: 'DEPOSIT',
        fontFamily: 'Rajdhani Bold',
        fontSize: 14,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      },
    })
    this.depositOrWithdrawButton.on('pointerup', () => {
      this.emit('depositOrWithdraw')
    })

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
      //disable: true,
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
      this.maxBetButton.set('interactive', false)
      this.betHalfButton.set('interactive', false)
      this.betDoubleButton.set('interactive', false)
    })

    this.betValueLabel.on('blur', (value) => {
      this.rollButton.set('interactive', true)
      this.maxBetButton.set('interactive', true)
      this.betHalfButton.set('interactive', true)
      this.betDoubleButton.set('interactive', true)

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

    this.payoutValueSprite = new PIXI.Sprite(PIXI.Texture.from(Resources.get('eos_png')))
    this.payoutValueSprite.anchor.set(0.5)
    this.payoutValueSprite.scale.set(1)

    this.gameModel.on('change:bet', (e) => {
      this.betValueLabel.set('text', this.gameModel.get('bet'))
      this.updateLabels()
      this.updateButtons()
    })

    this.gameModel.on('change:payout', (e) => {
      this.updateLabels()
    })

    this.gameModel.on('change:balance', () => {
      this.betValueLabel.set('max', this.gameModel.get('balance'))
      this.updateButtons()
    })

    this.gameModel.on('change:connected', (e) => {
      if (e.changed.connected) {
        this.rollButton.set('disable', false)
        this.betValueLabel.set('disable', false)
        this.maxBetButton.set('disable', false)
        this.betHalfButton.set('disable', false)
        this.betDoubleButton.set('disable', false)
        this.depositOrWithdrawButton.set('disable', false)
        this.depositOrWithdrawButton.set('text', 'WITHDRAW')

      } else {
        this.rollButton.set('disable', true)
        this.betValueLabel.set('disable', true)
        this.maxBetButton.set('disable', true)
        this.betHalfButton.set('disable', true)
        this.betDoubleButton.set('disable', true)
        this.depositOrWithdrawButton.set('disable', true)
      }
    })

    this.eventBus = window.eventBus
    this.eventBus.on(AppEvent.SpinStart, () => {
      this.rollButton.set({
        label: {
          visible: false,
        },
      })
      this.rollButtonSprite.visible = true
    })

    this.eventBus.on(AppEvent.SpinEnd, () => {
      this.rollButton.set({
        label: {
          visible: true,
        },
      })
      this.rollButtonSprite.visible = false
    })

    this.spinLog = new SpinLog()
    this.spinLog.on('proof', index => {
      this.emit('proof', this.gameModel.get('spinLog')[index])
    })

    this.addChild(this.rollButton)
    this.addChild(this.rollButtonSprite)
    this.addChild(this.maxBetButton)
    this.addChild(this.depositOrWithdrawButton)
    this.addChild(this.betBackground)
    this.addChild(this.betLabel)
    this.addChild(this.betValueLabel)
    this.addChild(this.betValueSprite)
    this.addChild(this.betHalfButton)
    this.addChild(this.betDoubleButton)
    this.addChild(this.payoutBackground)
    this.addChild(this.payoutLabel)
    this.addChild(this.payoutValueLabel)
    this.addChild(this.payoutValueSprite)
    this.addChild(this.spinLog)
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
    }
    else {
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
    let spinLogVisible = true
    let initialY = 90

    // iPhone 5 + SE
    if (window.app.currHeight <= 568) {
      spinLogVisible = false
      initialY = 25
    }

    this.spinLog.set({
      visible: spinLogVisible,
      list: {
        width: this.get('width'),
        height: 40,
      },
      y: 22.5,
    })

    this.betLabel.set({
      //: this.maxBetButton.get('y') + this.maxBetButton.get('height') + 25,
      y: initialY,
    })

    this.betBackground.set({
      y: this.betLabel.get('y') + this.betLabel.get('height') / 2 + 8,
      width: this.get('width') - this.betHalfButton.get('width') - this.betDoubleButton.get('width') - 20,
    })

    this.betValueSprite.position.set(
      this.betBackground.get('x') + 18,
      this.betBackground.get('y') + this.betBackground.get('height') / 2,
    )

    this.betValueLabel.set({
      x: this.betBackground.get('x') + 36,
      y: this.betBackground.get('y') + this.betBackground.get('height') / 2,
      width: (this.betBackground.get('width') - 55),
    })

    this.betHalfButton.set({
      x: this.betBackground.get('width') + 15,
      y: this.betLabel.get('y') + this.betLabel.get('height') / 2 + 8,
    })

    this.betDoubleButton.set({
      x: this.betHalfButton.get('x') + this.betHalfButton.get('width') + 5,
      y: this.betHalfButton.get('y'),
    })

    this.payoutBackground.set({
      y: this.betHalfButton.get('y') + this.betHalfButton.get('height') / 2 + 35,
      width: this.get('width'),
    })

    this.payoutLabel.set({
      x: 15,
      y: this.payoutBackground.get('y') + this.payoutBackground.get('height') / 2,
    })

    this.payoutValueLabel.set({
      x: this.payoutBackground.get('x') + this.payoutBackground.get('width') - 15,
      y: this.payoutBackground.get('y') + this.payoutBackground.get('height') / 2,
    })

    this.payoutValueSprite.position.set(
      this.payoutValueLabel.get('x') - this.payoutValueLabel.get('width') - 18,
      this.payoutValueLabel.get('y'),
    )

    this.rollButton.set({
      background: {
        width: this.get('width') - this.betHalfButton.get('width') - this.betDoubleButton.get('width') - 20,
      },
      y: this.payoutBackground.get('y') + this.payoutBackground.get('height') + 20,
    })

    this.maxBetButton.set({
      x: this.rollButton.get('width') + 14,
      y: this.rollButton.get('y'),
      background: {
        width: this.betHalfButton.get('width') + this.betDoubleButton.get('width') + 6,
      },
    })

    this.depositOrWithdrawButton.set({
      x: this.rollButton.get('width') + 14,
      y: this.maxBetButton.get('y') + this.rollButton.get('height') / 2 + this.depositOrWithdrawButton.get('height') / 2 + 25,
      background: {
        width: this.betHalfButton.get('width') + this.betDoubleButton.get('width') + 6,
      },
    })

    this.rollButtonSprite.x = this.rollButton.get('x') + this.rollButton.get('width') / 2
    this.rollButtonSprite.y = this.rollButton.get('y') + this.rollButton.get('height') / 2

    super.redraw(changed)
  }
}