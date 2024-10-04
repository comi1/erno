const fs = require('fs');
const Utility = require('../modules/Utility');
const commandToLoad = [];
module.exports = (client) => {

    const commandFolders = fs.readdirSync('./src/commands');
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../../src/commands/${folder}/${file}`);
            Utility.client.commands.set(command.name, command);
            commandToLoad.push(command)
            Utility.client.ApplicationCommands.push(command)
        } 
    }

    Utility.logMessage("success", `[ Commands ] Loaded ${commandToLoad.length} total commands`)
}
