import manifest from './dapp.manifest'
import dapp from './dapp.logic'

const dcapi = {
  platformId: process.env.DC_PLATFORM_ID,
  transport: 2,
  envTransportUrl: process.env.DC_TRANSPORT_URL || 'wss://wss.dev.dao.casino',
  blockchainType: 'EOS',
  blockchainNetwork: process.env.DAO_NETWORK,

  walletName: process.env.DC_WALLET_NAME ,
  privateKey: process.env.DC_PRIVATE_KEY ,

  gameEnv: process.env.DC_GAME_ENV || 'production',
}

export default {
  dcapi: dcapi,
  game: {
    name: manifest.slug,
    randomRanges: manifest.randomRanges,
    gameLogicFunction: dapp,
    rules: manifest.rules,
  },
}