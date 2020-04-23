# Dice

"Кубики" [Описание концепции](https://daocasino.atlassian.net/wiki/spaces/PD/pages/26640385/Concept+Dice)

## Оглавление

- [Требования к окружению](#требования-к-окружению)
- [Установка](#установка)
- [CLI команды](#cli)
- [Style Guide](#оформление-кода)

## Требования к окружению

- ОС: MacOS, Linux. В случае использования Windows наиболее практичный вариант использование WSL
- nodejs version: 10.16.0
- npm version: 6.9.0
- yarn version: ^1.16.0

## Установка

Склонировать репозиторий [dc-game-dice](https://github.com/DaoCasino/dc-game-dice)

```bash
  git clone https://github.com/DaoCasino/dc-game-dice.git
```

Зарегистрировать приватный npm-регистр по инструкции: [https://daocasino.atlassian.net/wiki/spaces/DAO/pages/27557889/Verdaccio](https://daocasino.atlassian.net/wiki/spaces/DAO/pages/27557889/Verdaccio)

Выполнить установку зависимостей с помощью yarn

```bash
cd dc-game-dice
yarn
```

## CLI

- `yarn start` - запуск версии игры с банкроллером
- `yarn start:mock` - запуск mock-версии игры (с "заглушкой" банкроллера и бэкенда)

- `yarn build` - cборка проекта

## Оформление кода

Для обеспечения соблюдения правил форматирования используются:

- [ESlint](https://eslint.org/) - javascript линтер

см. правила оформления кода в [.eslintrc.json](./.eslintrc.json)

Расширения vscode:

- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
