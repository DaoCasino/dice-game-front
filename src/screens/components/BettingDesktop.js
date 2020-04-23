import * as PIXI from 'pixi.js'

import Rectangle from '../../widgets/Rectangle'
import ManualBettingDesktop from './ManualBettingDesktop'

export default class BettingDesktop extends PIXI.Container {
  constructor(gameModel) {
    super()

    this.gameModel = gameModel

    this.background = new Rectangle({
      fill: '0x1b1b46',
    })

    this.mask = new PIXI.Graphics()
    this.manualBetting = new ManualBettingDesktop(gameModel)

    this.manualBetting.on('roll', () => this.emit('roll'))
    this.manualBetting.on('rollstart', () => this.emit('rollstart'))
    this.manualBetting.on('rollstop', () => this.emit('rollstop'))
    this.manualBetting.on('betMax', () => this.emit('betMax'))
    this.manualBetting.on('betHalf', () => this.emit('betHalf'))
    this.manualBetting.on('betDouble', () => this.emit('betDouble'))
    this.manualBetting.on('depositOrWithdraw', () => this.emit('depositOrWithdraw'))
    this.manualBetting.on('autospin', (count) => this.emit('autospin', count))
    this.manualBetting.on('proof', (props) => this.emit('proof', props))

    this.addChild(this.background)
    this.addChild(this.manualBetting)
  }

  update(dt) {
    this.manualBetting.update(dt)
  }

  resize(width, height) {
    this.mask.clear()
    this.mask.beginFill(0x000000)
    this.mask.drawRect(this.x, this.y, width, height)
    this.mask.endFill()

    this.background.set({
      width: width,
      height: height,
    })

    this.manualBetting.set({
      x: 25,// Utils.percent(width, 2.5),
      width: width - 50,//Utils.percent(width, 95),
      height: height - 42,
    })
  }
}