import { getConfig } from './src/utils/config.js';
import { setup } from './src/bot/bot.js';

const { discordToken, clientId, informChannel } = getConfig();

await setup(discordToken, clientId, informChannel);
