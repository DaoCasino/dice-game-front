import utils from './utils/Utils'
import { IframeMessagingProvider } from '@daocasino/platform-messaging/lib.browser/IframeMessagingProvider'

const ACTION_TYPE = 0
const REQUEST_TIMEOUT = 30000

const checkChance = chance => {
  if (chance < 1 || chance > 99) {
    throw new Error('Invalid chance')
  }
}

export class Dice {
  async init() {
    const result = {
      connected: false,
      balance: 0,
      params: null,
    }

    try {
      // 1 connect iframe
      const iframeMessagingProvider = await IframeMessagingProvider.create(
        'child'
      )
      this.service = iframeMessagingProvider.getRemoteService('GameService', REQUEST_TIMEOUT)

      result.connected = true
      // 2 get user balance
      result.balance = utils.betToFloat(await this.service.getBalance())
      // 3 get game params min max bet
      result.params = await this.service.getGameParams()

      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 27) {
          this.service.emit('esc')
        }
      }, false)
    } catch (err) {
      console.error(err)
    }

    return result
  }

  async roll(bet, number) {
    checkChance(number)
    console.time('roll')
    const deposit = utils.toBET(bet)

    try {
      let result = {}
      const { data } = await this.service.newGame(deposit, ACTION_TYPE, [
        Number(number),
      ])
      result.randomNumber = data.msg[0]
      result.profit = utils.betToFloat(data.player_win_amount)

      console.timeEnd('roll')
      return result
    } catch (err) {
      console.timeEnd('roll')
      throw err
    }
  }
}
