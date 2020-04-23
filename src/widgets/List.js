import * as PIXI from 'pixi.js'
import _ from 'underscore'

import Widget from './Widget'
import Utils from '../utils/Utils'

export default class List extends Widget {
  constructor(props = {}) {
    super(_.deepExtend({
      interactive: true,
      autoContentSize: true,
      autoScroll: false,
      type: 'horizontal', // vertical/horizontal
      margin: {
        x: 0,
        y: 0,
      },
      mask: {
        enabled: true,
      },
      contentSize: {
        width: 0,
        height: 0,
      },
    }, props || {}))

    this.draggingGlobal = null
    this.dragging = false

    this.maxSpeed = 4
    this.target = new PIXI.Point(0, 0)

    this.content = new PIXI.Container()
    super.addChild(this.content)

    const onWheel = (e) => {
      e = e || window.event

      // wheelDelta не дает возможность узнать количество пикселей
      const mousePos = new PIXI.Point(e.x, e.y)

      if (Utils.rectContainsPoint(this.content.getBounds(), mousePos)) {
        const getAllChildrensRecusive = (childrens, list) => {
          for (let i = 0; i < childrens.length; i++) {
            const children = childrens[i]

            list.push(children)

            getAllChildrensRecusive(children, list)
          }
        }

        // FIXME: костыль чтобы фильтровать скролл в скролле
        const allChildrens = []

        getAllChildrensRecusive(this.content.children, allChildrens)


        for (let i = 0; i < allChildrens.length; i++) {
          const children = allChildrens[i]

          if (children instanceof List) {
            if (Utils.rectContainsPoint(children.getBounds(), mousePos)) {
              return
            }
          }
        }

        const delta = e.deltaY || e.detail || e.wheelDelta

        const direction = new PIXI.Point(delta, delta)
        const axis = this.get('type') === 'horizontal' ? 'x' : 'y'
        const offset = -direction[axis]
        const pos = this.target[axis] + offset


        if (axis === 'x') {
          const min = 0
          const max = pos + this.get('contentSize').width

          if (this.get('contentSize').width > this.get('width')) {
            if (offset > 0) {
              if (pos < 0) {
                this.target[axis] = pos

              } else {
                this.target[axis] = min
              }

            } else if (offset < 0) {
              if (max > this.get('width')) {
                this.target[axis] = pos

              } else {
                this.target[axis] = -(this.get('contentSize').width - this.get('width'))
              }
            }
          }

        } else {
          const min = 0
          const max = pos + this.get('contentSize').height

          if (this.get('contentSize').height > this.get('height')) {
            if (offset > 0) {
              if (pos < 0) {
                this.target[axis] = pos

              } else {
                this.target[axis] = min
              }

            } else if (offset < 0) {
              if (max > this.get('height')) {
                this.target[axis] = pos

              } else {
                this.target[axis] = -(this.get('contentSize').height - this.get('height'))
              }
            }
          }
        }
      }
    }

    if (window.addEventListener) {
      if ('onwheel' in document) {
        // IE9+, FF17+, Ch31+
        window.addEventListener('wheel', onWheel)
      } else if ('onmousewheel' in document) {
        // устаревший вариант события
        window.addEventListener('mousewheel', onWheel)
      } else {
        // Firefox < 17
        window.addEventListener('MozMousePixelScroll', onWheel)
      }
    } else { // IE8-
      window.attachEvent('onmousewheel', onWheel)
    }

    this.on('pointerdown', (e) => {
      if ((e.target instanceof List === false) || (e.target instanceof List && e.target === this)) {
        this.draggingGlobal = new PIXI.Point(e.data.global.x, e.data.global.y)
        this.dragging = true
      }
    })

    this.on('pointermove', (e) => {
      if (this.dragging) {
        const direction = new PIXI.Point(e.data.global.x - this.draggingGlobal.x, e.data.global.y - this.draggingGlobal.y)
        const axis = this.get('type') === 'horizontal' ? 'x' : 'y'
        const offset = direction[axis]
        const pos = this.target[axis] + offset

        if (axis === 'x') {
          const min = 0
          const max = pos + this.get('contentSize').width

          if (this.get('contentSize').width > this.get('width')) {
            if (offset > 0) {
              if (pos < 0) {
                this.target[axis] = pos

              } else {
                this.target[axis] = min
              }

            } else if (offset < 0) {
              if (max > this.get('width')) {
                this.target[axis] = pos

              } else {
                this.target[axis] = -(this.get('contentSize').width - this.get('width'))
              }
            }
          }

        } else {
          const min = 0
          const max = pos + this.get('contentSize').height

          if (this.get('contentSize').height > this.get('height')) {
            if (offset > 0) {
              if (pos < 0) {
                this.target[axis] = pos

              } else {
                this.target[axis] = min
              }

            } else if (offset < 0) {
              if (max > this.get('height')) {
                this.target[axis] = pos

              } else {
                this.target[axis] = -(this.get('contentSize').height - this.get('height'))
              }
            }
          }
        }

        this.draggingGlobal = new PIXI.Point(e.data.global.x, e.data.global.y)
      }
    })

    this.on('pointerup', () => {
      this.draggingGlobal = null
      this.dragging = false
    })

    this.on('pointerupoutside', () => {
      this.draggingGlobal = null
      this.dragging = false
    })

    this.redraw()
  }

  addItem(child) {
    this.content.addChild(child)
    this.redraw()

    if (this.get('autoScroll')) {
      if (this.get('type') === 'horizontal') {
        if (this.get('contentSize').width > this.get('width')) {
          this.target.x = -(this.get('contentSize').width - this.get('width'))
        }

      } else if (this.get('type') === 'vertical') {
        if (this.get('contentSize').height > this.get('height')) {
          this.target.y = -(this.get('contentSize').height - this.get('height'))
        }
      }
    }

    return child
  }

  remvoveItem(child) {
    this.content.removeChild(child)
    this.redraw()

    return child
  }

  getItems() {
    return this.content.children
  }

  update(dt) {
    this.content.x += (this.target.x - this.content.x) / this.maxSpeed
    this.content.y += (this.target.y - this.content.y) / this.maxSpeed
  }

  redraw(changed) {
    changed = changed || this.model.attributes

    const horizontal = this.get('type') === 'horizontal'

    let width = 0
    let height = 0

    const childrens = this.content.children

    for (let i = 0; i < childrens.length; i++) {
      const children = childrens[i]

      if (horizontal) {
        children.x = width

      } else {
        children.y = height
      }

      width += children.width + (i < childrens.length - 1 ? this.get('margin').x : 0)
      height += children.height + (i < childrens.length - 1 ? this.get('margin').y : 0)
    }

    super.redraw(changed)

    this.set('mask', {
      width: this.get('width'),
      height: this.get('height'),
      enabled: this.get('mask').enabled,
    })

    if (this.get('autoContentSize')) {
      this.set({
        contentSize: {
          width: width,
          height: height,
        },
      }, { silent: true })
    }
  }
}
