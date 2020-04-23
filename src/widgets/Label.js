import _ from 'underscore'
import * as PIXI from 'pixi.js'

import Widget from './Widget'

export default class Label extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      text: '',
      fill: '0xffffff',
      stroke: 0,
      strokeThickness: 0,
      fontFamily: '',
      fontSize: 16,
      align: 'left',
      anchor: {
        x: 0,
        y: 0.5,
      },
      breakWords: false,
      wordWrap: false,
      wordWrapWidth: 0,
    }, props || {}))

    this.textField = new PIXI.Text()
    this.addChild(this.textField)

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('fill' in changed) {
      this.textField.style.fill = this.get('fill')
    }

    if ('stroke' in changed) {
      this.textField.style.sroke = this.get('stroke')
    }

    if ('strokeThickness' in changed) {
      this.textField.style.strokeThickness = this.get('strokeThickness')
    }

    if ('fontFamily' in changed) {
      this.textField.style.fontFamily = this.get('fontFamily')
    }

    if ('fontSize' in changed) {
      this.textField.style.fontSize = this.get('fontSize')
    }

    if ('align' in changed) {
      this.textField.style.align = this.get('align')
    }

    if ('fontStyle' in changed) {
      this.textField.style.fontStyle = this.get('fontStyle')
    }

    if ('fontWeight' in changed) {
      this.textField.style.fontWeight = this.get('fontWeight')
    }

    if ('lineHeight' in changed) {
      this.textField.style.lineHeight = this.get('lineHeight')
    }

    if ('text' in changed) {
      this.textField.text = this.get('text')
    }

    if ('breakWords' in changed) {
      this.textField.style.breakWords = this.get('breakWords')
    }

    if ('wordWrap' in changed) {
      this.textField.style.wordWrap = this.get('wordWrap')
    }

    if ('wordWrapWidth' in changed) {
      this.textField.style.wordWrapWidth = this.get('wordWrapWidth')
    }

    if ('anchor' in changed) {
      this.textField.anchor.set(changed.anchor.x, changed.anchor.y)
    }

    this.set({
      width: this.textField.width,
      height: this.textField.height,
    }, { silent: true })

    super.redraw(changed)
  }
}
