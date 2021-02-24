import resources from './resources'

export default {

  resources: resources,
  connected: false,

  deposit: 10,
  bet: 10,
  betStep: 1,
  betMin: 1,
  betMax: 10000,
  betOnWin: 0,
  betOnWinIncreaseMax: 1000,
  betOnWinDecreaseMax: 99,
  betOnWinAction: 'reset', // reset, increase, decrease
  betOnLoss: 0,
  betOnLossIncreaseMax: 1000,
  betOnLossDecreaseMax: 99,
  betOnLossAction: 'reset', // reset, increase, decrease
  stopOnWin: 0,
  stopOnLoss: 0,
  balance: 0,
  spinLog: [],
  lastRollover: 0,
  lastProfit: 0,
  lastIsWin: false,
  payout: 0,
  maxPayout: 990000,
  chance: 50,
  autospin: 0,
  autospinMode: false,
  autospinEnabled: false,
  autospinVariations: [
    5, 10, 25, 50, -1,
  ],
  autospinVariationIndex: 0,
  autospinInitialBalance: 0,
  autospinBalance: 0
}
