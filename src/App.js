import * as PIXI from 'pixi.js'
import WebFont from 'webfontloader'
import _ from 'underscore'

import './App.css'

import { Dice } from './Dice'
import { DiceMock } from './DiceMock'

import MainScreen from './screens/MainScreen'
import DeepModel from './utils/DeepModel'
import Resources from './utils/Resources'
import Sounds from './utils/Sounds'
import { CurrencyManager } from './utils/CurrencyManager'
import Utils from './utils/Utils'

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
  static instance = null;

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

  constructor() {
    App.instance = this
  }

  async checkInsufficientBalance() {
    const betMin = this.gameModel.get('betMin')
    const balance = this.gameModel.get('balance')

    console.log('checkInsufficientBalance', { betMin, balance })
    if (balance < betMin) {
      await this.gameAPI.emit('insufficient-balance')
    }
  }

  // return float balance
  async updateBalance() {
    const balance = await this.gameAPI.getBalance()
    this.gameModel.set('balance', balance)
    console.log('updateBalance', balance)

    await this.checkInsufficientBalance()
    return balance
  }

  async init(config) {
    this.config = config
    this.resources = this.config.resources
    console.log(process.env)
    console.log(
      '%c init started',
      'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;',
    )

    this.isMock =
      'GAME_IS_MOCK' in process.env
        ? process.env.GAME_IS_MOCK === 'true'
        : false

    const urlParams = new URLSearchParams(window.location.search)
    this.isMock = urlParams.has('demo') ? true : this.isMock

    this.eventBus = window.eventBus
    this.eventBus.emit(AppEvent.Initialize)

    this.cookiesName = 'dao-dice'
    this.soundEnabled = true

    this.gameModel = new DeepModel(this.config)
    this.gameModel.set('connected', false)
    this.gameModel.set(
      'autospin',
      this.gameModel.get('autospinVariations')[
        this.gameModel.get('autospinVariationIndex')
        ],
    )

    await this.connect()

    await this.loadFont()
    await this.loadResources()
    await this.initCurrency()
    await this.initSounds()

    this.loadCookies()
    this.setSoundEnabled(this.soundEnabled)

    this.releaseLoader()
    this.initInterface()


    this.gameModel.set('connected', true)
  }

  releaseLoader() {
    document.body.removeChild(
      document.body.getElementsByClassName('loading')[0],
    )
  }

  loadResources() {
    return new Promise(resolve => {
      console.log(
        '%c loading resources',
        'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;',
      )
      Resources.urlMap = this.config.resources.images
      Resources.loadAll().then(() => {
        console.log(
          '%c resources loaded',
          'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;',
        )
        resolve()
      })
    })
  }

  loadFont() {
    return new Promise(resolve => {
      console.log(
        '%c loading fonts',
        'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;',
      )
      WebFont.load({
        custom: {
          families: this.resources.fonts,
        },
        active: () => {
          console.log(
            '%c fonts loaded',
            'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;',
          )
          resolve()
        },
      })
    })
  }

  async setupDefaultCurrency() {
    const curr = 'BET'
    const precision = 2

    await this.currencyManager.setData([{
      type: curr,
      precision: precision,
      sources: [
        {
          key: 'bet',
          src: PIXI.Texture.from(Resources.get('eos_png')),
        },
      ],
    }])

    this.currencyManager.setCurrency(curr)

    console.warn('App::setupDefaultCurrency() - currency fallback to default')
  }

  async setupCurrency() {
    const urlParams = new URLSearchParams(window.location.search)
    const hasAllParams = urlParams.has('cur') && urlParams.has('curIcon') && urlParams.has('curPrecision')

    if (!hasAllParams) {
      console.error('App::setupCurrency() - invalid urlParams')

      return Promise.reject()
    }

    const cur = urlParams.get('cur')
    const curIcon = urlParams.get('curIcon')
    const curPrecision = parseInt(urlParams.get('curPrecision'), 10)

    const scale = 3

    let image = null

    try {
      image = await Utils.svg2img(curIcon, { width: 24 * scale, height: 24 * scale })

    } catch (error) {
      console.error('App::setupCurrency() - invalid imageUrl')

      return Promise.reject()
    }

    await this.currencyManager.setData([{
      type: cur,
      precision: curPrecision,
      scale: scale,
      sources: [
        {
          key: 'bet',
          src: new PIXI.Texture(new PIXI.BaseTexture(image)),
        },
      ],
    }])

    this.currencyManager.setCurrency(cur)

    return Promise.resolve()
  }

  async initCurrency() {
    this.currencyManager = new CurrencyManager()

    try {
      await this.setupCurrency()

    } catch (e) {
      await this.setupDefaultCurrency()
    }
  }

  async initInterface() {
    console.log(
      '%c init interface start',
      'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;',
    )
    this.initCanvas()
    this.initPIXI()
    this.initScene()
    this.initTicker()
    this.resize()
    console.log(
      '%c init interface finished',
      'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;',
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
        await this.updateBalance()

        this.eventBus.emit(AppEvent.SpinEnd, profit, randomNumber, isWin)
      } catch (err) {
        console.error(err)
        this.eventBus.emit(AppEvent.SpinError, err)
        alert('Play error')
      }
    })
  }

  initSounds() {
    return new Promise(resolve => {
      Sounds.init(this.config.resources.sounds)

      if (!this.soundEnabled) {
        Sounds.mute()
      }

      resolve()
    })
  }

  setSoundEnabled(value) {
    this.soundEnabled = value
    this.saveCookies()

    if (value) {
      Sounds.unmute()

    } else {
      Sounds.mute()
    }
  }

  saveCookies() {
    localStorage.setItem(this.cookiesName, JSON.stringify({
      soundEnabled: this.soundEnabled,
    }))
  }

  loadCookies() {
    const data = JSON.parse(localStorage.getItem(this.cookiesName))

    console.log('loadCookies', data)

    if (data) {
      this.soundEnabled = data.soundEnabled
    }
  }

  initTicker() {
    this.app.start()
    this.app.ticker.add(this.update, this)
  }

  /**
   * Connecting to the platform
   */
  async connect() {
    if (this.isMock) {
      this.gameAPI = new DiceMock()
      const { balance, betMin, betMax, maxPayout } = this.gameAPI.init()
      this.gameModel.set('balance', balance)
      this.gameModel.set('deposit', balance)
      this.gameModel.set('betMin', betMin)
      this.gameModel.set('betMax', betMax)
      this.gameModel.set('maxPayout', maxPayout)
      return Promise.resolve()
    } else {
      try {
        this.gameAPI = new Dice()

        // we get the necessary parameters for initializing the game
        const { connected, balance, params } = await this.gameAPI.init()

        this.gameModel.set('balance', balance)
        this.gameModel.set('deposit', balance)

        // we parse the parameters that came from the contract
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

  /**
   * Playing the game
   */
  play() {
    const userBet = this.gameModel.get('bet')
    const chance = this.gameModel.get('chance')

    Sounds.play('roll_' + _.sample([1, 2, 3]) + '_mp3')

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
