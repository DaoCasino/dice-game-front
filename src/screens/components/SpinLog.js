import _ from 'underscore'

import { AppEvent } from '../../App'
import Button from '../../widgets/Button'
import List from '../../widgets/List'
import Widget from '../../widgets/Widget'
import Label from '../../widgets/Label'

export default class SpinLog extends Widget {
  constructor(props) {
    super(_.deepExtend({
      list: {
        width: 0,
        height: 0,
      },
    }, props || {}))

    this.label = new Label({
      visible: true,
      text: 'You last bets will be displayed here',
      fontFamily: 'Rajdhani',
      fontSize: 14,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      alpha: 0.5,
      y: 18,
    })

    this.list = new List({
      width: 100,
      height: 40,
      autoScroll: true,
      margin: {
        x: 5,
        y: 0,
      },
    })

    this.hashPopup = new Button({
      visible: false,
      label: {
        text: 'hash',
      },
      background: {
        width: 100,
        height: 40,
        borderRadius: 18,
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
      },
    })

    this.addChild(this.label)
    this.addChild(this.list)
    this.addChild(this.hashPopup)

    this.evenBus = window.eventBus
    this.evenBus.on(AppEvent.SpinEnd, (profit, rollover) => {
      if (this.label.get('visible')) {
        this.label.set('visible', false)
      }

      this.createButton(profit, rollover)
    })
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    super.redraw(changed)

    if ('list' in changed) {
      this.list.set(changed.list)
    }
  }

  update(dt) {
    this.list.update(dt)
  }

  createButton(profit, rollover) {
    const fontSize = 14
    const mainButton = new Button({
      background: {
        borderRadius: 18,
        fill: '#000000',
        alpha: 0.20,
        height: 36,
      },
      label: {
        text: '',//profit.toFixed(4),
        fontFamily: 'Rajdhani',
        fontSize: fontSize,
        align: 'left',
        anchor: {
          x: 0,
          y: 0.5,
        },
        margin: {
          x: 0,
          y: 0,
        },
        fill: profit > 0 ? '#61ffb1' : '#ff6f61',
      },
    })

    const rolloverLabel = new Label({
      text: rollover,
      fontFamily: 'Rajdhani',
      fontSize: fontSize,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      //fill: '#ffffff',
      fill: profit > 0 ? '#61ffb1' : '#ff6f61',
    })

    rolloverLabel.set({
      x: 15,
      y: mainButton.get('background').height / 2,
    })

    mainButton.addChild(rolloverLabel)

    const infoButton = new Button({
      background: {
        type: 'circle',
        fill: '0x48486b',
        radius: 8,
      },
      label: {
        text: 'i',
        fontFamily: 'Rajdhani Bold',
        fontSize: fontSize,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        fill: '#000000',
      },
    })

    mainButton.set({
      background: {
        //width: 75 + rolloverLabel.get('width') + mainButton.label.get('width'),
        width: 45 + rolloverLabel.get('width') + mainButton.label.get('width'),
        height: 36,
      },
      label: {
        margin: {
          x: rolloverLabel.get('width') + 5,
          y: 0,
        },
      },
    })

    /*
    const arrow = new PIXI.Sprite(PIXI.Texture.from(Resources.get(profit > 0 ? 'up_png' : 'down_png')))

    arrow.anchor.set(0.5)
    arrow.scale.set(1)
    arrow.x = rolloverLabel.get('x') + rolloverLabel.get('width') + 8
    arrow.y = mainButton.get('background').height / 2

    mainButton.addChild(arrow)
    */

    infoButton.set({
      x: mainButton.get('background').width - 15 - infoButton.get('background').radius,
      y: mainButton.get('background').height / 2 - infoButton.get('background').radius / 2,
    })


    mainButton.on('pointertap', (e) => {
      const button = infoButton.parent
      const index = this.list.getItems().indexOf(button)

      this.emit('proof', index)
    })

    mainButton.addChild(infoButton)

    this.list.addItem(mainButton)
  }
}