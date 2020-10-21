// Game params
const MIN_BET = 1
const MAX_BET = 10000
const MAX_PAYOUT = 990000
const BALANCE = 100000000

const ALL_RANGE = 100.0 // total range of possible dice numbers
const HOUSE_EDGE = 0.01 // casino's house edge

function randomizeInteger(min, max) {
  if (max == null) {
    max = min == null ? Number.MAX_SAFE_INTEGER : min
    min = 0
  }

  min = Math.ceil(min) // inclusive min
  max = Math.floor(max) // exclusive max

  if (min > max - 1) {
    throw new Error('Incorrect arguments.')
  }

  return min + Math.floor((max - min) * Math.random())
}

const checkBet = deposit => {
  if (deposit < MIN_BET) {
    throw new Error('deposit less than min bet')
  }
  if (deposit > MAX_BET) {
    throw new Error('deposit greater than max bet')
  }
}

const checkNumber = number => {
  if (number < 0) {
    throw new Error('number should be more than 0')
  }
  if (number > ALL_RANGE) {
    throw new Error('number should be less than ' + ALL_RANGE)
  }
}

const getWinCoefficient = num => {
  return (ALL_RANGE / (ALL_RANGE - num)) * (1 - HOUSE_EDGE)
}

const getWinPayout = (bet, num) => {
  const result = bet * getWinCoefficient(num)
  return result < MAX_PAYOUT ? result : MAX_PAYOUT
}

const delay = (min, max) => new Promise((resolve) => setTimeout(resolve, randomizeInteger(min, max)))

export class DiceMock {
  init() {
    return {
      balance: BALANCE,
      betMin: MIN_BET,
      betMax: MAX_BET,
      maxPayout: MAX_PAYOUT,
    }
  }
  async roll(bet, number) {
    checkBet(bet)
    checkNumber(number)

    const randomNumber = randomizeInteger(ALL_RANGE)
    const profit = getWinPayout(bet, number)
    const isWin = randomNumber >= number

    await delay(1200, 2000) // simulate network latency for realism

    return {
      randomNumber,
      profit: isWin ? profit : profit * -1,
      isWin,
    }
  }

  getBalance() {
    return Promise.resolve(BALANCE)
  }
}
