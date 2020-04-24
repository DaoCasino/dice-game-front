const toBET = bet => bet.toFixed(4) + ' BET'
const betToFloat = bet => parseFloat(bet.replace(' BET', ''))

export class Dice {
  constructor(config, api, accountInfo) {
    this.config = config
    this.api = api
    this.accountInfo = accountInfo

  }


  waitForActionComplete (sessionId, updateType = 4, duration = 1000) { //  TODO: магия нужны константы
    const fetchUpdates = () => this.api.fetchSessionUpdates(sessionId)
    return new Promise((resolve, reject) => {
      const waitForActionComplete = () => {
        fetchUpdates().then(updates => {
            const update = updates.find(update => update.updateType === updateType)
            if (!update) {
                setTimeout(waitForActionComplete, duration)
                return
            }
            resolve(update.data.player_win_amount)
        }).catch(err => reject(err))
      }
      waitForActionComplete()
    })
  }



  async roll(bet, number) {
    console.time('roll')
    this.checkChance(number)

    const { casinoId, gameId, actionType } = this.config.platform
    const deposit = toBET(bet)

    // RandomNumber - почему-то массив от 1 до 10000
    let result = { RandomNumber: 0, profits: [0, 0] }

    // если profit > 0 -> выиграл игрок
    // profit < 0 - выиграл банкроллер
    // если profit = 0, на ставку еще не ответили

    try {
      const session = await this.api.newGame(casinoId, gameId, deposit, actionType, [Number(number)])
      console.log(session)
      const playerWinAmount = await this.waitForActionComplete(session.id)
      console.log({ playerWinAmount })
      result.profits[1] = betToFloat(playerWinAmount)
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

