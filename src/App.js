import * as PIXI from 'pixi.js'
import WebFont from 'webfontloader'

import { Dice } from './Dice'
import { DiceMock } from './DiceMock'

import MainScreen from './screens/MainScreen'
import DeepModel from './utils/DeepModel'
import Resources from './utils/Resources'

const AppState = {
  Preparing: 'preparing',
  Depositing: 'depositing',
  Spinning: 'spinning',
  Idle: 'idle',
}

const AppEvent = {
  Initialize: 'AppEventInitialize',
  Idle: 'AppEventIdle',
  Connect: 'AppEventConnect',
  Disconnect: 'AppEventDisconnect',
  SpinStart: 'AppEventSpin',
  SpinEnd: 'AppEventSpinComplete',
  SpinError: 'AppEventSpinError',
  AutoSpinEnabled: 'AppEventAutoSpinEnabled',
  AutoSpinDisabled: 'AppEventAutoSpinDisabled',
}

class App {
  getPayoutOnWin(bet, number) {
    return bet * this.getPayout(number)
  }

  getPayout(number) {
    return (1 / this.getWinChance(number)) * (1 - this.getHouseEdge())
  }

  getWinChance(number) {
    return this.getWinRange(number) / this.getAllRangeMax()
  }

  getWinRange(number) {
    return number * 100
  }

  getAllRangeMax() {
    return 10000
  }

  getHouseEdge() {
    return 0.01
  }

  async init(config) {
    this.config = config
    this.resources = this.config.resources
    console.log(process.env)
    console.log(
      '%c init started',
      'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
    )

    this.isMock =
      'GAME_IS_MOCK' in process.env
        ? process.env.GAME_IS_MOCK === 'true'
        : false

    this.eventBus = window.eventBus
    this.eventBus.emit(AppEvent.Initialize)

    this.gameModel = new DeepModel(this.config)
    this.gameModel.set('connected', false)
    this.gameModel.set(
      'autospin',
      this.gameModel.get('autospinVariations')[
        this.gameModel.get('autospinVariationIndex')
      ]
    )

    await this.connect()

    await this.loadFont()
    await this.loadResources()

    this.releaseLoader()
    this.initInterface()
  }

  releaseLoader() {
    document.body.removeChild(
      document.body.getElementsByClassName('loading')[0]
    )
  }

  loadResources() {
    return new Promise(resolve => {
      console.log(
        '%c loading resources',
        'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;'
      )
      Resources.urlMap = this.config.resources.images
      Resources.loadAll().then(() => {
        console.log(
          '%c resources loaded',
          'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
        )
        resolve()
      })
    })
  }

  loadFont() {
    return new Promise(resolve => {
      console.log(
        '%c loading fonts',
        'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;'
      )
      WebFont.load({
        custom: {
          families: this.resources.fonts,
        },
        active: () => {
          console.log(
            '%c fonts loaded',
            'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
          )
          resolve()
        },
      })
    })
  }

  async initInterface() {
    console.log(
      '%c init interface start',
      'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;'
    )
    this.initCanvas()
    this.initPIXI()
    this.initScene()
    this.initTicker()
    this.resize()
    console.log(
      '%c init interface finished',
      'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
    )
  }

  initCanvas() {
    this.width = 750 * 2
    this.height = 1334 * 2

    this.currWidth = this.width
    this.currHeight = this.height

    this.canvas = document.getElementById('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  initPIXI() {
    this.app = new PIXI.Application({
      view: this.canvas,
      transparent: false,
      resolution: 2,
      autoResize: true,
      antialias: false,
    })

    this.renderer = this.app.renderer
    this.stage = this.app.stage

    this.container = new PIXI.Container()
    this.stage.addChild(this.container)
  }

  initScene() {
    this.screen = new MainScreen(this.gameModel, this)
    this.container.addChild(this.screen)

    this.screen.on('roll', async () => {
      this.eventBus.emit(AppEvent.SpinStart)

      console.log('roll request sent')

      try {
      const result = await this.play()

      if (!result || (result && !('profit' in result))) {
        alert('Play error...')
        this.eventBus.emit(AppEvent.SpinError, null)
        return
      }

      const { profit, randomNumber, isWin } = result
      const spinLog = this.gameModel.get('spinLog')

      spinLog.push({
        prediction: 100 - this.gameModel.get('chance'),
        amount: this.gameModel.get('bet'),
        result: randomNumber,
        payout: profit,
      })

      this.gameModel.set('spinLog', spinLog)

      this.gameModel.set(
        'balance',
        parseFloat((this.gameModel.get('balance') + profit).toFixed(4))
      )
      this.eventBus.emit(AppEvent.SpinEnd, profit, randomNumber, isWin)
      } catch (err) {
        console.error(err)
        this.eventBus.emit(AppEvent.SpinError, err)
        alert('Play error')
      }
    })
  }

  initTicker() {
    this.app.start()
    this.app.ticker.add(this.update, this)
  }

  async connect() {
    if (this.isMock) {
      this.gameAPI = new DiceMock()
      return Promise.resolve()
    } else {
      try {
        this.gameAPI = new Dice()
        const { connected, balance, params } = await this.gameAPI.init()

        this.gameModel.set('connected', connected)
        this.gameModel.set('balance', balance)
        this.gameModel.set('deposit', balance)

        params.forEach(({ type, value }) => {
          switch (type) {
            case 0:
              this.config.betMin = value / 10000
              this.gameModel.set('betMin', this.config.betMin)
              console.log({ betMin: this.config.betMin })
              break
            case 1:
              this.config.betMax = value / 10000
              this.gameModel.set('betMax', this.config.betMax)
              console.log({ betMax: this.config.betMax })
              break
            case 2:
              this.config.maxPayout = value / 10000
              this.gameModel.set('maxPayout', this.config.maxPayout)
              console.log({ maxPayout: this.config.maxPayout })
          }
        })
      } catch (err) {
        console.error(err)
        return Promise.reject(err)
      }
    }
  }

  play() {
    const userBet = this.gameModel.get('bet')
    const chance = this.gameModel.get('chance')

    return this.gameAPI.roll(userBet, 100 - chance)
  }

  disconnect() {
    console.log('disconnect, beforeunload')
  }

  update(dt) {
    if (
      window.innerWidth !== this.currWidth ||
      window.innerHeight !== this.currHeight
    ) {
      this.resize()
    }

    this.screen.update(dt)
  }

  resize() {
    const currWidth = window.innerWidth
    const currHeight = window.innerHeight

    this.currWidth = currWidth
    this.currHeight = currHeight

    this.canvas.width = currWidth
    this.canvas.height = currHeight

    this.renderer.resize(currWidth, currHeight)

    this.screen.resize(currWidth, currHeight)
  }
}

export { AppState, AppEvent, App }
