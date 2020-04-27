import * as PIXI from 'pixi.js'
import WebFont from 'webfontloader'

import { Dice } from './Dice'
import { DiceMock } from './DiceMock'

import utils from './utils/Utils'

import { connect, GameParamsType } from '@daocasino/platform-back-js-lib'

import MainScreen from './screens/MainScreen'
import DeepModel from './utils/DeepModel'
import Resources from './utils/Resources'

const AppState = {
  Preparing: 'preparing',
  Depositing: 'depositing',
  Spinning: 'spinning',
  Idle: 'idle',
  Withdrawing: 'withdrawing',
}

const AppEvent = {
  Initialize: 'AppEventInitialize',
  Idle: 'AppEventIdle',
  Connect: 'AppEventConnect',
  Disconnect: 'AppEventDisconnect',
  SpinStart: 'AppEventSpin',
  SpinEnd: ' AppEventSpinComplete',
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

    await this.loadFont()
    await this.loadResources()
    this.setDefaultValues()
    this.initInterface()
    await this.connect()
    this.onGameReady()
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

  setDefaultValues() {
    this.gameModel.set('balance', this.gameModel.get('deposit'))
    console.log(
      '%c default values set',
      'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
    )
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

    this.screen.on('roll', () => {
      this.eventBus.emit(AppEvent.SpinStart)

      console.log('roll request sent')
      this.play().then(result => {
        console.log('play result', result)

        if (!result || (result && !result.profits)) {
          alert('Play error...')
        }

        const profit = result.profits[1]
        const roll = parseFloat((100 - result.RandomNumber / 100).toFixed(2))

        const spinLog = this.gameModel.get('spinLog')

        spinLog.push({
          prediction: 100 - this.gameModel.get('chance'),
          amount: this.gameModel.get('bet'),
          result: roll,
          payout: profit,
        })

        this.gameModel.set('spinLog', spinLog)

        this.gameModel.set(
          'balance',
          parseFloat(
            (this.gameModel.get('balance') + result.profits[1]).toFixed(4)
          )
        )
        this.eventBus.emit(AppEvent.SpinEnd, profit, roll)
      })
    })
  }

  initTicker() {
    this.app.start()
    this.app.ticker.add(this.update, this)
  }

  async initAPI() {
    console.log(
      '%c init API start',
      'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;'
    )
    console.groupCollapsed('Init DC Web Api')
    console.table(this.dcconfig.dcapi)
    console.table(this.dcconfig.game)
    console.groupEnd()

    if (this.isMock) {
      console.log(
        '%c init Mock API finished',
        'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
      )
    } else {
      console.log(
        '%c create game',
        'padding: 7px; background: #ab5e00; color: #ffffff; font: 1.3rem/1 Arial;'
      )
      const { game, account } = await this.API.init()
      this.game = game
      this.account = account

      const address = await this.account.getAddress()
      this.gameModel.set('playerId', address)
      await this.game.createGame(this.dcconfig.game)
      await this.onAccountUpdate()
      console.log(
        '%c game successfully created',
        'padding: 7px; background: #005918; color: #ffffff; font: 1.3rem/1 Arial;'
      )
    }

    return Promise.resolve()
  }

  async onGameReady() {
    this.gameModel.set({
      connected: true,
      balance: this.gameModel.get('deposit'),
    })
  }

  async onAccountUpdate() {
    // TODO: переделать
    const address = await this.account.getAddress()
    const accountId = await this.account.getAccountId()
    const balances = await this.account.getBalances()

    console.log('address', address)
    console.log('id', accountId)
    console.log('balances', balances)
    console.log('deposit in config', this.config.deposit)

    this.gameModel.set('deposit', Math.min(this.config.deposit, balances.total))
  }

  withdraw() {
    // TODO: где? вызывается?
    this.gameModel.set('connected', false)

    this.disconnect().then(result => {
      this.eventBus.emit(AppEvent.Disconnect)
    })
  }

  async connect(deposit) {
    if (this.isMock) {
      this.gameAPI = new DiceMock()
      return Promise.resolve()
    } else {
      const { backendAdrr, userName, casinoId, gameId } = this.config.platform
      try {
        const connection = await connect(backendAdrr, userName, false)
        const api = await connection.listen(
          () => {
            // This triggers when backend sends update of game session
          },
          () => {
            // This triggers when the connection is closed
          }
        )

        const accountInfo = await api.accountInfo()

        // Init Default values
        const getBalance = async () => {
          const { balance } = accountInfo
          return utils.betToFloat(balance)
        }

        const setMinMaxBets = async () => {
          // TODO: не очень красиво и правильно
          const { params } = (await api.fetchGamesInCasino(casinoId)).filter(game => game.gameId === gameId)[0]
          if (!params || !Array.IsArray(params)) { return }
          params.forEach(({ type, value }) => {
            switch (type) {
              case GameParamsType.minBet:
                this.config.betMin = value / 10000
                this.gameModel.set('betMin', this.config.betMin)
                // console.log({ betMin: this.config.betMin })
                break
              case GameParamsType.maxBet:
                this.config.betMax = value / 10000
                this.gameModel.set('betMax', this.config.betMax)
                // console.log({ betMax: this.config.betMax })
                break
            }
          })
        }

        await setMinMaxBets()
        this.config.balance = await getBalance(accountInfo)
        this.gameModel.set('balance', this.config.balance)
        this.setDefaultValues()

        this.gameAPI = new Dice(this.config, api, accountInfo)
      } catch (err) {
        // TODO: надо красиво обработать ошибку
        console.error(err)
        return Promise.reject(err)
      }
    }
  }

  play() {
    const userBet = this.gameModel.get('bet')
    const chance = this.gameModel.get('chance')

    return this.gameAPI.roll(userBet, chance).catch(function (err) {
      console.error(err)
    })
  }

  disconnect() {
    // TODO: когда она вызывается? при beforeunload и в withdraw
    try {
      return new Promise(resolve => {
        this.game.disconnect().then(result => {
          console.log('Disconnect res', result)

          this.onAccountUpdate() // TODO: !

          resolve(result)
        })
      })
    } catch (err) {
      console.error('Disconnect error', err)

      return new Promise(resolve => {
        resolve(null)
      })
    }
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
