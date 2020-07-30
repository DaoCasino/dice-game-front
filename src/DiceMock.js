export class DiceMock {
    roll(bet, number){
      this.checkChance(number)
      return Promise.resolve({ randomNumber: 50, profit: 0.98, isWin: false })
    }

    checkChance(chance) {
      if (chance < 1 || chance > 99) {
        throw new Error('Invalid chance')
      }
    }
  }