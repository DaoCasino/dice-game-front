module.exports = function(userBets, gameData, randoms) {
  function getPlayerRangeMin() {
    return 1
  }

  function getPlayerRangeMax() {
    return 99
  }

  function getAllRangeMin() {
    return 1
  }

  function getAllRangeMax() {
    return 10000
  }

  function getHouseEdge() {
    return 0.01
  }

  function getWinRange(number) {
    return number * 100
  }

  function getWinChance(number) {
    return getWinRange(number) / getAllRangeMax()
  }

  function getPayout(number) {
    return 1 / getWinChance(number) * (1 - getHouseEdge())
  }

  function getPayoutOnWin(bet, number) {
    return bet * getPayout(number)
  }

  const BET = userBets[1]
  const CHANCE = gameData.custom.playersData[1].chance
  const RANDOM = randoms[0]

  let profit = -BET

  if (Number(RANDOM) <= Number(CHANCE)) {
    profit = parseFloat((getPayoutOnWin(BET, CHANCE) * 100).toFixed(4))
  }

  console.log('BET: ' + BET + ' CHANCE: ' + CHANCE + ' RANDOM: ' + RANDOM + ' PROFIT: ' + profit)

  return { profits: [-profit, profit] }
}
