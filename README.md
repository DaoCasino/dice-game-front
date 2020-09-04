# Dice
## Table of Contents

- [Dice](#dice)
  - [Table of Contents](#table-of-contents)
  - [Environment requirements](#environment-requirements)
  - [Installation](#installation)
  - [CLI](#cli)
  - [Code formatting](#code-formatting)
  - [Platform integration / Getting Started](#platform-integration--getting-started)
    - [actionType and updateType parameter](#actiontype-and-updatetype-parameter)

## Environment requirements

- OS: MacOS, Linux. In case of using Windows, the most practical option is to use WSL
- nodejs version: 10.16.0
- npm version: 6.9.0
- yarn version: ^ 1.16.0

## Installation

`yarn`

## CLI

- `yarn start` - start the game
- `yarn start: mock` - start the mock-version of the game (with a" stub ")
- `yarn build` - build the project

## Code formatting

To ensure compliance with formatting rules are used:

- [ESlint](https://eslint.org/) - javascript linter

see coding rules in [.eslintrc.json](./.eslintrc.json)

Vscode extensions:

- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Platform integration / Getting Started
To make the game easier to integrate, separate the business logic of your application from the interface. In Dice, I have an outlined the main game API class with one `roll` method (see the file [DiceMock.js](./src/DiceMock.js))
```JS
roll (bet, number) {
   return {randomNumber: 50, profit: 0.98, isWin: false}
}
```
The first step is to add the SDK to the project.
```
yarn add @daocasino/platform-back-js-lib
```
```JS
import { getRemoteGameSerivce } from '@daocasino/platform-back-js-lib'
```

First, you need to initialize the game's communication with the platform. This is done using the SDK method `getRemoteGameSerivce`, as a result, you will return an instance of the class [`GameService`](https://github.com/DaoCasino/game-js-sdk/blob/develop/src/gameService.ts). **Important:** there must be a single instance of this class, use the singleton pattern or just attach it to window
```JS
window.service = await getRemoteGameService ();
```
If the method call succeeds, congratulations, you are successfully connected to the platform.

Inputs for the `roll` method are bet amount and the number that the player has chosen, you need to transfer this to the contract. For this, the `GameService` has a `newGame` method
```TS
public async newGame <T> (
       deposit: string,
       actionType: number,
       params: number [],
       updateType: number | number [] = [UpdateTypes.GameFinishedUpdate],
       duration: number = WAIT_ACTION_DURATION
   ): Promise <GameSessionUpdate <T>> {
```
We are interested in the first three parameters.
* `deposit` is a bet string like "1.0000 BET"
* `actionType` - the number of the action from the contract that starts the game, usually 0, but it all depends on the actions in the smart-contract. More on this parameter below.
* `params` - parameters that are passed to the called action. The order and values ​​of these parameters depend on the developer of the game contract. Specifically for Dice see [dice.cpp](https://github.com/DaoCasino/dice-game/blob/master/contracts/src/dice.cpp#L28)

The `newGame` method creates a new game session each time. If in the future you need to perform several actions within one game session, use the `gameAction` method.
```JS
const onStartButtonHandle = (...) => window.service.newGame (...)
const onPlayNextButtonHandle = (...) => window.service.gameAction (...)
```

### actionType and updateType parameter
The contract as a result of the execution of `action` can return different `updates`, type of updates are game specific (see [Game life-cycle](https://github.com/daocasino/game-contract-sdk#game-life-cycle) description). When the contract is created, developer documents what types of actions the contract performs and what `action` numbers to call and which `update` to expect from the contract. A complete list of `updateTypes` can be found [here](https://github.com/DaoCasino/platform-back/blob/master/models/game_session_update.go#L34-L41).

In the simplest case, when the game consists of one action, the contract ends the session and you will receive `GameFinishedUpdate` = 4. In the SDK code this is the default value, so the `updateTypes` parameter can be omitted in the call to `newGame` and `gameAction`

There are many more interesting methods in `GameService`, see the example of implementing game logic in the [Dice.js](./src/Dice.js) file.
