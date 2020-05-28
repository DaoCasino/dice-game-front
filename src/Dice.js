import utils from './utils/Utils'
import { IframeMessagingProvider } from '@daocasino/platform-messaging/lib.browser/IframeMessagingProvider'

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
        }

        try {
        // 1 connect iframe
        const iframeMessagingProvider = await IframeMessagingProvider.create('child')
        this.service = iframeMessagingProvider.getRemoteService('GameService')

        result.connected = true
        // 2 get user balance
        result.balance = utils.betToFloat(await this.service.getBalance())


        // TODO: need to do
        // 3 get game params min max bet
        } catch(err) {
            console.error(err)
        }

        return result
    }

    async roll(bet, number) {
        checkChance(number)

        console.time('roll')
        const deposit = utils.toBET(bet)
        let result = { randomNumber: undefined, profit: undefined }

        try {
            const data = await this.service.newGame(deposit, [Number(number)])
            result.randomNumber = data.msg[0]
            result.profit = utils.betToFloat(data.player_win_amount)
        } catch (err) {
            console.error(err)
        }

        console.timeEnd('roll')
        return result
    }
}