import _ from 'underscore'

import Widget from './Widget'
import TextInput from '../utils/PIXITextInput'

export default class InputLabel extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      width: '500px',
      type: 'text',
      min: 0.01,
      max: 999999999999,
      maxLength: 10,
      maxDecimal: 4,
      placeholder: 'Enter your text...',
      text: '',
      fill: '#ffffff',
      fontFamily: '',
      fontSize: 16,
      align: 'left',
    }, props || {}))

    this.textField = new TextInput({
      input: {
        disabled: this.get('disable'),
        type: this.get('type'),
        width: this.get('width') + 'px',
        min: this.get('min'),
        max: this.get('max'),
        fontFamily: this.get('fontFamily'),
        fontSize: this.get('fontSize') + 'px',
        color: this.get('fill'),
      },
    })

    this.textField.on('input', text => {
      this.set('text', text)
      this.emit('input', text)
    })

    this.textField.on('focus', text => {
      this.set('text', text)
      this.emit('focus', text)
    })

    this.textField.on('blur', text => {
      this.set('text', text)
      this.emit('blur', text)
    })

    this.textField.text = this.get('text')
    this.textField.placeholder = this.get('placeholder')

    this.addChild(this.textField)

    this.redraw()
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    if ('min' in changed) {
      this.textField.setInputStyle('min', this.get('min'))
      this.textField._onBlurred()
    }

    if ('max' in changed) {
      this.textField.setInputStyle('max', this.get('max'))
      this.textField._onBlurred()
    }

    if ('maxLength' in changed) {
      this.textField.setInputStyle('maxLength', this.get('maxLength'))
      this.textField._onBlurred()
    }

    if ('width' in changed) {
      this.textField.setInputStyle('width', this.get('width') + 'px')
    }

    if ('fill' in changed) {
      this.textField.setInputStyle('color', this.get('fill'))
    }

    if ('fontFamily' in changed) {
      this.textField.setInputStyle('fontFamily', this.get('fontFamily'))
    }

    if ('fontSize' in changed) {
      this.textField.setInputStyle('fontSize', this.get('fontSize') + 'px')
    }

    if ('align' in changed) {
      this.textField.setInputStyle('text-align', this.get('fontSize'))
    }

    if ('text' in changed) {
      this.textField.text = this.get('text')
    }

    if ('placeholder' in changed) {
      this.textField.placeholder = this.get('placeholder')
    }

    if ('disable' in changed) {
      this.textField.disabled = this.get('disable')
    }

    if ('align' in changed) {
      switch (this.get('align')) {
        case 'center':
          this.textField.pivot.x = this.textField.width / 2
          this.textField.pivot.y = this.textField.height / 2
          break

        case 'left':
          this.textField.pivot.x = 0
          this.textField.pivot.y = this.textField.height / 2
          break

        case 'right':
          this.textField.pivot.x = 1
          this.textField.pivot.y = this.textField.height / 2
          break
      }
    }

    this.set({
      width: this.textField.width,
      height: this.textField.height,
    }, { silent: true })

    super.redraw(changed)
  }

  getTextWidth() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    context.font = this.get('fontSize') + 'px ' + this.get('fontFamily')

    const metrics = context.measureText(this.get('text'))

    return metrics.width
  }
}
