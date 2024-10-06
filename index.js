const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Utility = require('./utils/modules/Utility');
const client = new Client({ intents: Object.values(GatewayIntentBits), partials: Object.values(Partials) });
const commands = require('./utils/handlers/commands');
const events = require('./utils/handlers/events');
const errors = require('./utils/modules/errors');
const addons = require('./utils/handlers/addons');

client.on('ready', async () => {
    Utility.logger.startup;
    Utility.prepareTable()
    Utility.status(client, Utility.config.status)
    Utility.config;
    Utility.messages;
    Utility.permission
    Utility.createMissingFolders()
    Utility.logger.ready
    await commands(client);
    await events(client);
    await addons(client)
})

setTimeout(async () => {
    client.application.commands.set(Utility.client.ApplicationCommands)
    await Utility.setupMessage()
}, 3000);

process.on('unhandledRejection', (error) => {
   errors(error);
   return;      
})

process.on('uncaughtException', (error) => {
    errors(error);
    return;
})

client.on('error', (error) => {
    errors(error);
    return;
})

process.on('uncaughtExceptionMonitor', (error) => {
    errors(error);
    return;
})

client.on('rateLimit', (info) => {
    console.log(`Bot is being rate limited!`);
    console.log(info);
});

Utility.variables.setVariable('guild', client.guilds.cache.first())

client.on('guildCreate', (guild) => {
    guild.leave();
    Utility.logMessage("error", `[ Erno ] [ Guild Detected ] Bot left the ${guild.name}, this bot is single guild only.`)
})


client.login(Utility.config.token)
module.exports = client;

