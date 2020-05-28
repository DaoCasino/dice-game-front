import resources from './resources'

export default {

  resources: resources,
  connected: false,

  deposit: process.env.BUILD_MODE === 'development' ? 1 : 5,
  bet: process.env.BUILD_MODE === 'development' ? 1 : 1,
  betMin: process.env.BUILD_MODE === 'development' ? 1 : 1,
  betMax: process.env.BUILD_MODE === 'development' ? 1000000 : 1000000,
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
  payout: 0,
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