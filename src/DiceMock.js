export class DiceMock {
    roll(bet, number){
      this.checkChance(number)
      return Promise.resolve({ RandomNumber: number, profits: [0, 0] })
    }

    checkChance(chance) {
      if (chance < 1 || chance > 99) {
        throw new Error('Invalid chance')
      }
    }
  }