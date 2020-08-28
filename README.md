# Dice

"Кубики"

## Оглавление

- [Dice](#dice)
  - [Оглавление](#оглавление)
  - [Требования к окружению](#требования-к-окружению)
  - [Установка](#установка)
  - [CLI](#cli)
  - [Оформление кода](#оформление-кода)
  - [Platform integration / Getting Started](#platform-integration--getting-started)
    - [Немного о параметре updateTypes](#немного-о-параметре-updatetypes)

## Требования к окружению

- ОС: MacOS, Linux. В случае использования Windows наиболее практичный вариант использование WSL
- nodejs version: 10.16.0
- npm version: 6.9.0
- yarn version: ^1.16.0

## Установка

`yarn`

## CLI

- `yarn start` - запуск игры
- `yarn start:mock` - запуск mock-версии игры (с "заглушкой")
- `yarn build` - cборка проекта

## Оформление кода

Для обеспечения соблюдения правил форматирования используются:

- [ESlint](https://eslint.org/) - javascript линтер

см. правила оформления кода в [.eslintrc.json](./.eslintrc.json)

Расширения vscode:

- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Platform integration / Getting Started
Что бы игру было проще интегрировать отделите бизнес логику вашего приложения от представления. В Dice я выделил основной класс игрового API с одним  методом `roll` (см. файл [DiceMock.js](https://github.com/DaoCasino/dice-game-front/blob/master/src/DiceMock.js))
```JS
roll(bet, number) {
   return { randomNumber: 50, profit: 0.98, isWin: false }
}
```
После того как визуальная часть игры будет написана и отлажена, можно приступить к интеграции.
Первым делом нужно добавить SDK к проекту.
```
yarn add @daocasino/platform-back-js-lib
```
```JS
import { getRemoteGameSerivce } from '@daocasino/platform-back-js-lib'
```

Для начала нужно инициализировать общение игры с сайтом платформы. Делается это с помощью метода SDK `getRemoteGameSerivce` в результате вам вернется инстанс класса [`GameService`](https://github.com/DaoCasino/game-js-sdk/blob/develop/src/gameService.ts). **Важно:** инстанс этого класса должен быть единственным, используйте паттерн singleton или просто прикрепите его к window
```JS
window.service = await getRemoteGameService();
```
Если вызов метода завершился успешно, поздравляю вы успешно подключены к платформе.

Вернемся к нашему методу `roll`. На входе он получает ставку и число которое выбрал пользователь, нужно это передать в контракт. Для этого в `GameService` есть метод `newGame`
```TS
public async newGame<T>(
       deposit: string,
       actionType: number,
       params: number[],
       updateType: number | number[] = [UpdateTypes.GameFinishedUpdate],
       duration: number = WAIT_ACTION_DURATION
   ): Promise<GameSessionUpdate<T>> {
```
Нас интересуют первые три параметра.
* `deposit` - это строка ставки вида “1.0000 BET”
* `actionType` - номер action из контракта который начинает игру, обычно это 0, но все зависит от фантазии разработчика контракта игры.
* `params` - параметры которые передаются в вызываемый action. Порядок и значения этих параметров зависят от разработчика контракта игры.

Метод `newGame` каждый раз создает новую игровую сессию. Это нужно понимать, поэтому если вам в дальнейшем понадобиться выполнить несколько action в рамках одной игровой сессии используйте метод `gameAction`.
```JS
const onStartButtonHandle  = (...) => window.service.newGame(...)
const onPlayNextButtonHandle  = (...) => window.service.gameAction(...)
```

### Немного о параметре updateTypes
Контракт в результате выполнения `action` может возвращать разные `update`, какие они будут, когда они будут возвращаться это все зависит от разработчика контракта игры. Попросите его расписать какие номера `action` вам вызывать и какие `update` ждать от контракта. В самом простом случае, когда игра состоит из одного действия контракт завершает сессию и вам придет `GameFinished` = 4. В коде SDK это значение по умолчанию поэтому параметр `updateTypes` можно опустить в вызове `newGame` и `gameAction`

В `GameService` есть еще много интересных методов, чтобы уложить все в голове смотрите пример реализации игровой логики в файле [Dice.js](https://github.com/DaoCasino/dice-game-front/blob/master/src/Dice.js).

Совет: логику игры лучше писать на TypeSctipt, в ходе разработки вы сделаете меньше ошибок и получите полезные подсказки IDE о типах и методах которые есть в SDK


