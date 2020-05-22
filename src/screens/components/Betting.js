import * as PIXI from 'pixi.js'
import _ from 'underscore'

import { TweenMax } from 'gsap'

import Rectangle from '../../widgets/Rectangle'
import ManualBetting from './ManualBetting'
import Label from '../../widgets/Label'
import AutoBetting from './AutoBetting'

export default class Betting extends PIXI.Container {
  constructor(gameModel) {
    super()

    this.gameModel = gameModel

    this.background = new Rectangle({
      fill: '0x1b1b46',
    })

    this.mask = new PIXI.Graphics()

    const tabLabelStyle = {
      fill: '0xffffff',
      fontFamily: 'Rajdhani',
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      fontSize: 16,
      alpha: 0.7,
      interactive: true,
      buttonMode: true,
    }

    this.panelContainer = new PIXI.Container()

    this.panels = [
      new ManualBetting(gameModel),
      new AutoBetting(gameModel),
    ]

    this.tabs = [
      new Label(_.defaults({
        text: 'MANUAL BET',
      }, tabLabelStyle)),
      new Label(_.defaults({
        text: 'AUTO BET',
      }, tabLabelStyle)),
    ]

    this.tabLine = new Rectangle({
      fill: '0x323259',
    })

    this.tabLineHighlight = new Rectangle({
      fill: '0x5d8edd',
    })

    this.addChild(this.background)
    this.addChild(this.tabLine)
    this.addChild(this.tabLineHighlight)
    this.addChild(this.panelContainer)

    this.panels.forEach(panel => {
      panel.on('roll', () => this.emit('roll'))
      panel.on('rollstart', () => this.emit('rollstart'))
      panel.on('rollstop', () => this.emit('rollstop'))
      panel.on('betMax', () => this.emit('betMax'))
      panel.on('betHalf', () => this.emit('betHalf'))
      panel.on('betDouble', () => this.emit('betDouble'))
      panel.on('depositOrWithdraw', () => this.emit('depositOrWithdraw'))
      panel.on('autospin', (count) => this.emit('autospin', count))
      panel.on('proof', (props) => this.emit('proof', props))

      this.panelContainer.addChild(panel)
    })

    this.tabs.forEach((tab, index) => {
      const onTabClick = (tab) => {
        const currTab = this.tabs[index]

        TweenMax.killTweensOf(this.tabLineHighlight)
        TweenMax.to(this.tabLineHighlight, 0.5, {
          x: currTab.get('x') - currTab.get('width') / 2,
          width: currTab.get('width'),
          onComplete: () => {
            currTab.set('width', currTab.width, { silent: true })
            currTab.set('x', currTab.x, { silent: true })
          },
        })

        TweenMax.killTweensOf(this.panelContainer)
        TweenMax.to(this.panelContainer, 0.5, { x: -this.background.get('width') * index })

        this.tabIndex = index

        this.updateTabsFill()
      }

      tab.on('pointerup', onTabClick.bind(this))

      this.addChild(tab)
    })

    this.updateTabsFill()
  }

  update(dt) {
    this.panels.forEach(panel => {
      panel.update(dt)
    })
  }

  updateTabsFill() {
    this.tabs.forEach((tab, index) => {
      tab.set({
        fill: index === this.tabIndex ? '0x5d8edd' : '0xffffff',
      })
    })
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

    this.tabLine.set({
      y: 40,
      width: width,
      height: 1,
    })

    this.tabs.forEach((tab, index) => {
      tab.set({
        x: width * (index === 0 ? 0.25 : 0.75),
        y: this.tabLine.get('y') / 2,
        width: width,
        height: height,
      })
    })

    TweenMax.killTweensOf(this.tabLineHighlight)

    this.tabLineHighlight.set({
      x: this.tabs[this.tabIndex].get('x') - this.tabs[this.tabIndex].get('width') / 2,
      y: this.tabLine.get('y') - 1,
      width: this.tabs[this.tabIndex].get('width'),
      height: 3,
    })

    this.panels.forEach((panel, index) => {
      if (panel instanceof ManualBetting) {
        panel.set({
          x: width * index + 25,// Utils.percent(width, 2.5),
          y: this.tabLine.get('y') + 2,
          width: width - 50,//Utils.percent(width, 95),
          height: height - 42,
        })

      } else if (panel instanceof AutoBetting) {
        panel.set({
          x: width * index + 25,//Utils.percent(width, 2.5),
          y: this.tabLine.get('y') + 2,
          width: width - 50,//Utils.percent(width, 95),
          height: height - 42,
        })
      }
    })
  }
}