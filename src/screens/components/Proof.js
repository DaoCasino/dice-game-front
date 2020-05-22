import * as PIXI from 'pixi.js'
import _ from 'underscore'
import { TweenMax } from 'gsap'

import Rectangle from '../../widgets/Rectangle'
import Widget from '../../widgets/Widget'
import Button from '../../widgets/Button'
import Label from '../../widgets/Label'
import List from '../../widgets/List'

export default class Proof extends Widget {
  constructor(props) {
    super(_.deepExtend({
      blackout: {
        interactive: true,
        fill: '0x03000d',
        alpha: 0.9,
      },
      background: {
        width: 383,
        height: 607,
        fill: '0x020c18',
        borderRadius: 10,
      },
    }, props || {}))

    this.gameModel = window.app.gameModel

    this.blackout = new Rectangle(this.get('blackout'))
    this.blackout.on('pointerdown', () => {
      this.hide()
    })

    this.background = new Rectangle(this.get('background'))

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

    this.content = new PIXI.Container()
    this.list.addItem(this.content)

    this.closeButton = new Button({
      background: {
        width: 32,
        height: 32,
        borderRadius: 8,
        fill: '0x020c18',
        stroke: '0x06263b',
        strokeThickness: 2,
      },
      label: {
        text: 'x',
        fontFamily: 'Rajdhani Bold',
        fontSize: 22,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        margin: {
          x: 0,
          y: -3,
        },
      },
    })

    this.closeButton.on('pointerup', () => {
      this.hide()
    })

    /*
    this.playerLabel = new Label({
      text: 'PLAYER',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.4,
    })

    this.playerValueLabel = new Label({
      text: this.gameModel.get('playerId'),
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: 303,
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0.5,
        y: 0,
      },
    })
     */

    this.predictionLabel = new Label({
      text: 'PREDICTION',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.4,
    })

    this.predictionValueLabel = new Label({
      text: 'Over ' + this.gameModel.get('chance'),
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
    })

    this.amountLabel = new Label({
      text: 'AMOUNT',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.4,
    })

    this.amountValueLabel = new Label({
      text: this.gameModel.get('bet'),
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
    })

    this.resultLabel = new Label({
      text: 'RESULT',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.4,
    })

    this.resultValueLabel = new Label({
      text: this.gameModel.get('bet'),
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
    })

    this.payoutLabel = new Label({
      text: 'PAYOUT',
      fontFamily: 'Rajdhani',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.4,
    })

    this.payoutValueLabel = new Label({
      text: this.gameModel.get('bet'),
      fontFamily: 'Rajdhani',
      fontSize: 20,
      align: 'left',
      anchor: {
        x: 0,
        y: 0,
      },
    })

    this.proofButton = new Button({
      background: {
        borderRadius: 8,
        gradientFrom: '#5792f0',
        gradientTo: '#6e62e4',
        height: 44,
      },
      label: {
        text: 'VIEW PROOF',
        fontFamily: 'Rajdhani Bold',
        fontSize: 16,
        align: 'center',
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      },
    })

    this.addChild(this.blackout)
    this.addChild(this.background)
    this.addChild(this.list)

    this.content.addChild(this.closeButton)
    ///this.content.addChild(this.playerLabel)
    //this.content.addChild(this.playerValueLabel)
    this.content.addChild(this.predictionLabel)
    this.content.addChild(this.predictionValueLabel)
    this.content.addChild(this.amountLabel)
    this.content.addChild(this.amountValueLabel)
    this.content.addChild(this.resultLabel)
    this.content.addChild(this.resultValueLabel)
    this.content.addChild(this.payoutLabel)
    this.content.addChild(this.payoutValueLabel)
    this.content.addChild(this.proofButton)
  }

  update(dt) {
    this.list.update(dt)
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('blackout' in changed) {
      this.blackout.set(changed.blackout)
    }

    if ('background' in changed) {
      this.background.set(changed.background)
    }

    this.blackout.set({
      width: this.get('width'),
      height: this.get('height'),
    })

    this.background.set({
      width: this.get('width'),
      height: Math.max(607, this.get('height') * 0.9),
    })

    this.background.set({
      x: (this.get('width') - this.background.get('width')) / 2,
      y: Math.max(0, (this.get('height') - this.background.get('height'))),
    })

    this.list.set({
      y: 40,
    })

    /*
    this.playerLabel.set({
      x: this.background.get('x') + 24,
      y: this.list.get('y') + 40
     })

    this.playerValueLabel.set({
      x: this.background.get('x') + this.background.get('width') / 2,
      y: this.playerLabel.get('y') + this.playerLabel.get('height') + 10,
    })
     */

    this.predictionLabel.set({
      x: this.background.get('x') + 24,
      y: this.list.get('y') + 40,
      /*
      x: this.playerLabel.get('x'),
      y: this.playerValueLabel.get('y') + this.playerValueLabel.get('height') + 32,
       */
    })

    this.predictionValueLabel.set({
      x: this.predictionLabel.get('x'),
      y: this.predictionLabel.get('y') + this.predictionLabel.get('height') + 10,
    })

    this.amountLabel.set({
      x: this.predictionLabel.get('x'),
      y: this.predictionValueLabel.get('y') + this.predictionValueLabel.get('height') + 32,
    })

    this.amountValueLabel.set({
      x: this.amountLabel.get('x'),
      y: this.amountLabel.get('y') + this.amountLabel.get('height') + 10,
    })

    this.resultLabel.set({
      x: this.predictionLabel.get('x'),
      y: this.amountValueLabel.get('y') + this.amountValueLabel.get('height') + 32,
    })

    this.resultValueLabel.set({
      x: this.resultLabel.get('x'),
      y: this.resultLabel.get('y') + this.resultLabel.get('height') + 10,
    })

    this.payoutLabel.set({
      x: this.predictionLabel.get('x'),
      y: this.resultValueLabel.get('y') + this.resultValueLabel.get('height') + 32,
    })

    this.payoutValueLabel.set({
      x: this.payoutLabel.get('x'),
      y: this.payoutLabel.get('y') + this.payoutLabel.get('height') + 10,
    })

    this.proofButton.set({
      background: {
        width: this.background.get('width') - 48,
      },
    })

    this.proofButton.set({
      x: this.list.get('x') + this.background.get('width') / 2 - this.proofButton.get('width') / 2,
      y: this.list.get('y') + this.background.get('height') - this.proofButton.get('height') - 44,
    })

    this.closeButton.set({
      x: this.list.get('x') + this.background.get('width') - this.closeButton.get('width') - 20,
      y: this.list.get('y'),
    })

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
        height: this.content.height + 38,
      },
    }, { silent: true })
    //

    super.redraw(changed)
  }

  show(props) {
    this.predictionValueLabel.set('text', 'Over ' + props.prediction)
    this.amountValueLabel.set('text', props.amount)
    this.resultValueLabel.set('text', props.result)
    this.payoutValueLabel.set({
      text: props.payout,
      fill: props.payout > 0 ? '0x61ffb1' : '0xff6f61',
    })

    this.set({
      visible: true,
    })

    TweenMax.to(this, 0.1, {
      alpha: 1, onComplete: () => {
        this.set('alpha', 1, { silent: true })
      },
    })
  }

  hide() {
    TweenMax.to(this, 0.1, {
      alpha: 0, onComplete: () => {
        this.set('visible', false)
        this.set('alpha', 0, { silent: true })
      },
    })
  }
}