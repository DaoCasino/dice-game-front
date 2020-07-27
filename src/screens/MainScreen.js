import * as PIXI from 'pixi.js'
import _ from 'underscore'
import { isMobile } from 'mobile-device-detect'

import BaseScreen from './BaseScreen'
import Rectangle from '../widgets/Rectangle'
import Slider from '../widgets/Slider'
import Label from '../widgets/Label'
import Utils from '../utils/Utils'
import Betting from './components/Betting'
import { App, AppEvent } from '../App'
import Resources from '../utils/Resources'
import Button from '../widgets/Button'
import AutoBettingDesktop from './components/AutoBettingDesktop'
import BettingDesktop from './components/BettingDesktop'
import ProofDesktop from './components/ProofDesktop'
import Proof from './components/Proof'

export default class MainScreen extends BaseScreen {
  constructor(gameModel, app) {
    super()

    this.gameModel = gameModel
    this.app = app

    this.background = new Rectangle({
      fill: '0x0E1037',
    })

    this.slider = new Slider({
      value: this.gameModel.get('chance'),
      min: 1,
      max: 99,
      height: 26,
      handle: {
        width: 44,
        height: 44,
        fill: '0xffffff',
        borderRadius: 8,
      },
      backgroundLeft: {
        fill: '0xff6f61',
        borderRadius: 5,
      },
      backgroundRight: {
        fill: '0x61ffb1',
        borderRadius: 5,
      },
      stepping: true,
      showSteps: true,
      steps: 5,
    })
    this.slider.on('change', (percent) => {
      this.sliderValueLine.set('visible', false)
      this.sliderValueButton.set('visible', false)

      this.updateSliderValue(percent)
    })

    this.sliderValueLine = new Rectangle({
      visible: false,
      width: 2,
      height: 17,
      fill: '0xff6f61', // 0x00ff00
    })

    this.sliderValueButton = new Button({
      visible: false,
      interactive: false,
      interactiveChildren: false,
      buttonMode: false,
      background: {
        borderRadius: 14,
        fill: '0xff6f61', // 0x00ff00
        height: 26,
      },
      label: {
        text: '32.86',
        fontFamily: 'Rajdhani',
        fontSize: 14,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        margin: {
          x: 0,
          y: 0,
        },
        fill: '0x000000',
      },
    })

    this.labelContainer = new PIXI.Container()
    this.labelValueContainer = new PIXI.Container()

    const labelStyle = {
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      fill: '0xffffff',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      alpha: 0.4,
    }

    this.rolloverLabel = new Label(_.defaults({ text: 'ROLL OVER' }, labelStyle))
    this.payoutLabel = new Label(_.defaults({ text: 'PAYOUT' }, labelStyle))
    this.chanceLabel = new Label(_.defaults({ text: 'WIN CHANCE' }, labelStyle))

    const labelValueStyle = {
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      fill: '0xffffff',
      fontFamily: 'Rajdhani',
      fontSize: 20,
    }

    this.rolloverValueLabel = new Label(labelValueStyle)
    this.payoutValueLabel = new Label(labelValueStyle)
    this.chanceValueLabel = new Label(labelValueStyle)

    this.rolloverValueArrow = new PIXI.Sprite(PIXI.Texture.from(Resources.get('up_png')))
    this.rolloverValueArrow.anchor.set(0.5)
    this.rolloverValueArrow.scale.set(1)

    if (isMobile) {
      this.betting = new Betting(this.gameModel)

    } else {
      this.betting = new BettingDesktop(this.gameModel)
    }

    this.betting.on('roll', () => {
      if (this.gameModel.get('bet') > this.gameModel.get('balance')) {
        alert('Not enough money!')
        return
      }

      if (this.gameModel.get('balance') <= 0) {
        alert('Not enough money!')
        return
      }

      if (this.gameModel.get('bet') > this.gameModel.get('betMax')) {
        alert(`Max bet: ${this.gameModel.get('betMax')}`)
        return
      }

      if (this.gameModel.get('bet') < this.gameModel.get('betMin')) {
        alert(`Min bet: ${this.gameModel.get('betMin')}`)
        return
      }

      this.emit('roll')
    })
    this.betting.on('betMax', () => {
      const balance = this.gameModel.get('balance')

      if (balance > 0) {
        const betMax = this.gameModel.get('betMax')
        this.gameModel.set('bet', Math.min(betMax, balance))

        this.updateSliderValue(this.slider.get('value'))

        this.emit('roll')

      } else {
        alert('Invalid balance!')
      }
    })
    this.betting.on('betHalf', () => {
      const balance = this.gameModel.get('balance')
      const bet = (this.gameModel.get('bet') / 2).toFixed(4)
      let calculatedBet = Math.max(this.gameModel.get('betMin'), parseFloat(bet))

      if (calculatedBet > balance) {
        calculatedBet = balance
      }
      this.gameModel.set('bet', calculatedBet)

      this.updateSliderValue(this.slider.get('value'))
    })
    this.betting.on('betDouble', () => {
      const balance = this.gameModel.get('balance')
      const betMax = this.gameModel.get('betMax')
      const bet = (this.gameModel.get('bet') * 2).toFixed(4)

      this.gameModel.set('bet', Math.min(balance, betMax, parseFloat(bet)))

      this.updateSliderValue(this.slider.get('value'))
    })
    this.betting.on('autospin', (count) => {
      console.log(count)
      this.gameModel.set('autospin', count)
    })
    this.betting.on('rollstart', (count) => {
      if (this.gameModel.get('bet') > this.gameModel.get('balance')) {
        alert('Not enough money!')
        return
      }

      if (this.gameModel.get('balance') <= 0) {
        alert('Not enough money!')
        return
      }

      //if (this.gameModel.get('autospin') === 0) {
      this.gameModel.set('autospin', this.gameModel.get('autospinVariations')[this.gameModel.get('autospinVariationIndex')])
      this.gameModel.set('autospinBalance', 0)
      //}

      this.gameModel.set('autospinEnabled', true)
      this.emit('roll')
    })
    this.betting.on('rollstop', (count) => {
      this.gameModel.set('autospinEnabled', false)
      this.gameModel.set('autospin', 0)
    })
    this.betting.on('proof', (props) => {
      this.proof.show(props)
    })

    this.gameModel.on('change:bet', () => {
      this.sliderValueLine.set('visible', false)
      this.sliderValueButton.set('visible', false)

      this.updateSliderValue(this.slider.get('value'))
    })

    this.gameModel.on('change:autospinEnabled', (e) => {
      if (e.changed.autospinEnabled) {
        this.slider.set({
          handle: {
            buttonMode: false,
            interactive: false,
          },
        })

      } else {
        this.slider.set({
          handle: {
            buttonMode: true,
            interactive: true,
          },
        })
      }
    })

    this.eventBus = window.eventBus

    this.eventBus.on(AppEvent.Connect, () => {
      this.updateSliderValue(this.slider.get('value'))
    })

    this.eventBus.on(AppEvent.SpinStart, () => {
      this.slider.set({
        handle: {
          buttonMode: false,
          interactive: false,
        },
      })

      this.sliderValueLine.set('visible', false)
      this.sliderValueButton.set('visible', false)
    })

    this.eventBus.on(AppEvent.SpinError, (err) => {
      this.resize(this.app.currWidth, this.app.currHeight)
      if (this.gameModel.get('autospinEnabled')) {
        this.gameModel.set('autospinEnabled', false)
      } else {
        this.slider.set({
          handle: {
            buttonMode: true,
            interactive: true,
          },
        })
      }

      // this.sliderValueLine.set('visible', true)
      // this.sliderValueButton.set('visible', true)
    })

    this.eventBus.on(AppEvent.SpinEnd, (profit, rollover, isWin) => {
      this.gameModel.set('lastRollover', rollover)
      this.gameModel.set('lastProfit', profit)
      this.gameModel.set('lastIsWin', isWin)

      this.resize(this.app.currWidth, this.app.currHeight)

      if (this.gameModel.get('autospinEnabled')) {
        const autospins = this.gameModel.get('autospin')
        this.gameModel.set('autospin', autospins === -1 ? autospins : autospins - 1)

        if (this.gameModel.get('autospin') > 0 || this.gameModel.get('autospin') === -1) {
          let autoSpinBalance = this.gameModel.get('autospinBalance')

          if (profit > 0) {
            this.gameModel.set('autospinBalance', parseFloat(parseFloat(autoSpinBalance + profit - this.gameModel.get('bet')).toFixed(4)))

          } else {
            this.gameModel.set('autospinBalance', parseFloat(parseFloat(autoSpinBalance - this.gameModel.get('bet')).toFixed(4)))
          }

          autoSpinBalance = this.gameModel.get('autospinBalance')

          console.log('BalanceDiff: ' + autoSpinBalance)

          const stopOnWin = this.gameModel.get('stopOnWin')
          const stopOnLoss = this.gameModel.get('stopOnLoss')

          let stopRoll = false

          if (autoSpinBalance > 0) {
            if (stopOnWin > 0) {
              if (autoSpinBalance >= stopOnWin) {
                stopRoll = true
              }
            }
          }

          if (autoSpinBalance < 0) {
            if (stopOnLoss > 0) {
              if (Math.abs(autoSpinBalance) >= stopOnLoss) {
                stopRoll = true
              }
            }
          }

          const bet = this.gameModel.get('bet')

          const betOnLoss = this.gameModel.get('betOnLoss')
          const betOnLossAction = this.gameModel.get('betOnLossAction')

          if (betOnLoss > 0 && profit < 0) {
            if (betOnLossAction === 'increase') {
              this.gameModel.set('bet', Math.min(this.gameModel.get('balance'), parseFloat((bet + bet * betOnLoss / 100).toFixed(4))))

            } else if (betOnLossAction === 'decrease') {
              this.gameModel.set('bet', Math.max(this.gameModel.get('betMin'), parseFloat((bet - bet * betOnLoss / 100).toFixed(4))))
            }
          }

          const betOnWin = this.gameModel.get('betOnWin')
          const betOnWinAction = this.gameModel.get('betOnWinAction')

          if (betOnWin > 0 && profit > 0) {
            if (betOnWinAction === 'increase') {
              this.gameModel.set('bet', Math.min(this.gameModel.get('balance'), parseFloat((bet + bet * betOnWin / 100).toFixed(4))))

            } else if (betOnWinAction === 'decrease') {
              this.gameModel.set('bet', Math.max(this.gameModel.get('betMin'), parseFloat((bet - bet * betOnWin / 100).toFixed(4))))
            }
          }

          if (this.gameModel.get('bet') > this.gameModel.get('balance')) {
            stopRoll = true
            alert('Not enough money!')
          }

          if (this.gameModel.get('balance') <= 0) {
            stopRoll = true
            alert('Not enough money!')
          }

          if (!stopRoll) {
            setTimeout(() => this.emit('roll'), 1000)

          } else {
            this.gameModel.set('autospinEnabled', false)
          }

        } else {
          this.gameModel.set('autospinEnabled', false)
        }

      } else {
        this.slider.set({
          handle: {
            buttonMode: true,
            interactive: true,
          },
        })
      }

      this.sliderValueLine.set('visible', true)
      this.sliderValueButton.set('visible', true)
    })

    this.rightPanel = new AutoBettingDesktop(null, this.gameModel)
    //this.rightPanel = new SpinLogPanel()

    if (isMobile) {
      this.proof = new Proof()

    } else {
      this.proof = new ProofDesktop({
        background: {
          width: 383,
          height: 625,
        },
      })
    }

    this.proof.set({
      visible: false,
      alpha: 0,
    })

    this.addChild(this.background)
    this.addChild(this.sliderValueLine)
    this.addChild(this.slider)
    this.addChild(this.sliderValueButton)
    this.addChild(this.labelContainer)
    this.addChild(this.labelValueContainer)
    this.addChild(this.betting)
    this.addChild(this.rightPanel)
    this.addChild(this.proof)

    this.labelContainer.addChild(this.rolloverLabel)
    this.labelContainer.addChild(this.payoutLabel)
    this.labelContainer.addChild(this.chanceLabel)

    this.labelValueContainer.addChild(this.rolloverValueLabel)
    this.labelValueContainer.addChild(this.rolloverValueArrow)
    this.labelValueContainer.addChild(this.payoutValueLabel)
    this.labelValueContainer.addChild(this.chanceValueLabel)

    this.updateSliderValue(this.slider.get('value'))
  }

  update(dt) {
    this.betting.update(dt)

    if (this.rightPanel.get('visible')) {
      this.rightPanel.update(dt)
    }

    if (this.proof.get('visible')) {
      this.proof.update(dt)
    }
  }

  resize(width, height) {
    super.resize(width, height)

    const profit = this.gameModel.get('lastProfit')
    const rollover = this.gameModel.get('lastRollover')
    const isWin = this.gameModel.get('lastIsWin')

    this.background.set({
      width: width,
      height: height,
    })

    let fullWidth = width
    let fullHeight = height

    if (!isMobile) {
      width = Math.max(Math.min(960, width), 900)
      height = Math.max(Math.min(520, height), 520)
    }

    const sliderWidth = isMobile ? Utils.percent(width, 90) : width * 0.65 - 100//Utils.percent(width * 0.65, 80)

    this.slider.set({
      x: isMobile ? (width - sliderWidth) / 2 : (fullWidth - width) / 2 + (width * 0.65 - sliderWidth) / 2,
      width: sliderWidth,
    })

    if (isMobile) {
      this.slider.set({
        y: Utils.percent(height, 6.5),
      })

      this.rolloverLabel.x = width * 0.2
      this.payoutLabel.x = width * 0.5
      this.chanceLabel.x = width * 0.8

      this.rolloverValueLabel.x = width * 0.185
      this.rolloverValueArrow.x = this.rolloverValueLabel.x + this.rolloverValueLabel.width / 2 + 10
      this.payoutValueLabel.x = width * 0.5
      this.chanceValueLabel.x = width * 0.8

      this.labelContainer.y = Utils.percent(height, 18.5)
      this.labelValueContainer.y = Utils.percent(height, 23.5)

      this.rightPanel.set({
        visible: false,
      })

      let bettingPercentY = 31
      let bettingHeightPercent = 69

      // iPhone 5 + SE
      if (this.app.currHeight <= 568) {
        bettingPercentY = 28
        bettingHeightPercent = 72
      }

      this.betting.y = Utils.percent(height, bettingPercentY)
      this.betting.resize(isMobile ? width : width * 0.65, Utils.percent(height, bettingHeightPercent))

    } else {
      this.slider.set({
        y: Utils.percent(height, 17),
      })

      this.rolloverLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.2
      this.payoutLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.5
      this.chanceLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.8

      this.rolloverValueLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.185
      this.rolloverValueArrow.x = this.rolloverValueLabel.x + this.rolloverValueLabel.width / 2 + 10
      this.payoutValueLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.5
      this.chanceValueLabel.x = (fullWidth - width) / 2 + width * 0.65 * 0.8

      this.labelContainer.y = Utils.percent(height, 32.5)
      this.labelValueContainer.y = Utils.percent(height, 37.5)

      this.rightPanel.set({
        width: width * 0.35 - 1 - 50,
        height: height,// - 85,
        visible: true,
        x: (fullWidth - width) / 2 + width * 0.65 + 1,
        background: {
          width: width * 0.35 - 1,
          height: height,
        },
        list: {
          x: 25,
          y: (height - this.rightPanel.content.height) / 2,
          width: width * 0.35 - 1 - 50,
          height: height,// - 85,
        },
      })

      let bettingPercentY = 50
      let bettingHeightPercent = 50

      this.betting.x = (fullWidth - width) / 2
      this.betting.y = Utils.percent(height, bettingPercentY)
      this.betting.resize(isMobile ? width : width * 0.65, Utils.percent(height, bettingHeightPercent))
    }

    const fill = isWin ? '0x61ffb1' :'0xff6f61'

    this.sliderValueLine.set({
      x: this.slider.get('x') + Utils.remap(rollover, 0, 100, 0, this.slider.get('width')),
      y: this.slider.get('y') - 8,
      fill,
    })

    this.sliderValueButton.set({
      label: {
        text: rollover,
      },
    })

    this.sliderValueButton.set({
      background: {
        width: this.sliderValueButton.label.width + 20,
        fill,
      },
    })

    this.sliderValueButton.set({
      x: this.sliderValueLine.get('x') - this.sliderValueButton.get('width') / 2,
      y: this.slider.get('y') - 20 - this.sliderValueButton.get('height') / 2,
    })

    if (isMobile) {
      this.proof.set({
        width: width,
        height: height,
      })

    } else {
      this.proof.set({
        width: fullWidth,
        height: fullHeight,
      })
    }

    this.proof.redraw()
  }


  updateSliderValue(value) {
    const winChance = 100 - this.app.getWinChance(value) * 100
    const payout = this.app.getPayout(100 - value)
    const payoutOnWin = parseFloat(this.app.getPayoutOnWin(this.gameModel.get('bet'), 100 - value).toFixed(4))
    const maxPayout = this.gameModel.get('maxPayout')

    this.gameModel.set('chance', winChance)
    this.gameModel.set('payout', parseFloat(Math.min(maxPayout, payoutOnWin).toFixed(2)))

    this.setPayoutText(payout.toFixed(2))
    this.setRollOverText(value.toFixed(0))
    this.setChanceText(winChance.toFixed(0))

    this.resize(this.app.currWidth, this.app.currHeight)
  }

  setRollOverText(value) {
    this.rolloverValueLabel.set('text', value)
  }

  setPayoutText(value) {
    this.payoutValueLabel.set('text', 'x' + value)
  }

  setChanceText(value) {
    this.chanceValueLabel.set('text', value + '%')
  }
}