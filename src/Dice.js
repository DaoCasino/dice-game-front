import utils from './utils/Utils'

const WAIT_UPDATE_TYPE = 4
const WAIT_DURATION = 100

export class Dice {
  constructor(config, api) {
    this.config = config
    this.api = api
  }


  waitForActionComplete (sessionId, updateType = WAIT_UPDATE_TYPE, duration = WAIT_DURATION) {
    const fetchUpdates = () => this.api.fetchSessionUpdates(sessionId)
    return new Promise((resolve, reject) => {
      const waitForActionComplete = () => {
        fetchUpdates().then(updates => {
            const update = updates.find(update => update.updateType === updateType)
            if (!update) {
                setTimeout(waitForActionComplete, duration)
                return
            }
            resolve(update.data)
        }).catch(err => reject(err))
      }
      waitForActionComplete()
    })
  }



  async roll(bet, number) {
    console.time('roll')
    this.checkChance(number)

    const { casinoId, gameId, actionType } = this.config.platform
    const deposit = utils.toBET(bet)

    let result = { randomNumber: undefined, profit: undefined }

    // если profit > 0 -> выиграл игрок
    // profit < 0 - выиграл банкроллер
    // если profit = 0, на ставку еще не ответили

    try {
      const session = await this.api.newGame(casinoId, gameId, deposit, actionType, [Number(number)])
      console.log(session)
      const data = await this.waitForActionComplete(session.id)

      result.randomNumber = data.msg[0]
      result.profit = utils.betToFloat(data.player_win_amount)
    } catch (err) {
      console.error(err)
    }

    console.timeEnd('roll')
    return result
  }

  checkChance(chance) {
    if (chance < 1 || chance > 99) {
      throw new Error('Invalid chance')
    }
  }
}

