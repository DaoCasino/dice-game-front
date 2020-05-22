import _ from 'underscore'
import Button from '../../widgets/Button'
import Widget from '../../widgets/Widget'
import Label from '../../widgets/Label'
import Rectangle from '../../widgets/Rectangle'
import { AppEvent } from '../../App'
import List from '../../widgets/List'

export default class SpinLogDesktop extends Widget {
  constructor(props) {
    super(_.deepExtend({
      list: {
        width: 0,
        height: 0,
      },
    }, props || {}))

    this.background = new Rectangle({
      fill: '0x1b1b46',
    })

    this.label = new Label({
      visible: true,
      text: 'Last results',
      fontFamily: 'Rajdhani',
      fontSize: 23,
      align: 'center',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      y: 38,
    })

    this.line = new Rectangle({
      fill: '0x323259',
    })

    this.list = new List({
      type: 'vertical',
      width: 100,
      height: 40,
      autoScroll: false,
      margin: {
        x: 0,
        y: 8,
      },
    })

    this.addChild(this.background)
    this.addChild(this.line)
    this.addChild(this.list)
    this.addChild(this.label)

    this.evenBus = window.eventBus
    this.evenBus.on(AppEvent.SpinEnd, (profit, rollover) => {
      this.createButton(profit, rollover)
    })
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('background' in changed) {
      this.background.set(changed.background)
    }

    if ('list' in changed) {
      this.list.set(changed.list)
    }

    this.line.set({
      y: 80,
      width: this.background.get('width'),
      height: 1,
    })

    this.label.set({
      x: this.background.get('width') / 2,
    })

    this.list.getItems().forEach(item => {
      item.set({
        background: {
          width: this.list.get('width'),
          height: 36,
        },
      })

      const infoButton = item.infoButton

      infoButton.set({
        x: item.get('background').width - 15 - infoButton.get('background').radius,
        y: item.get('background').height / 2 - infoButton.get('background').radius / 2,
      })
    })

    super.redraw(changed)
  }

  update(dt) {
    this.list.update(dt)
  }

  createButton(profit, rollover) {
    const fontSize = 14
    const mainButton = new Button({
      interactive: false,
      interactiveChildren: false,
      buttonMode: false,
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

    mainButton.addChild(rolloverLabel)

    mainButton.set({
      background: {
        //width: 75 + rolloverLabel.get('width') + mainButton.label.get('width'),
        width: this.list.get('width'),// * 0.9,// + rolloverLabel.get('width') + mainButton.label.get('width'),
        height: 36,
      },
      label: {
        margin: {
          x: rolloverLabel.get('width') + 5,
          y: 0,
        },
      },
    })


    rolloverLabel.set({
      x: 15,
      y: mainButton.get('background').height / 2,
    })

    const infoButton = new Button({
      interactive: true,
      interactiveChildren: true,
      buttonMode: true,
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

    infoButton.set({
      x: mainButton.get('background').width - 15 - infoButton.get('background').radius,
      y: mainButton.get('background').height / 2 - infoButton.get('background').radius / 2,
    })

    mainButton.infoButton = infoButton

    mainButton.addChild(infoButton)

    this.list.addItem(mainButton)
  }
}