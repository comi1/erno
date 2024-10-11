const fs = require('fs');
const Utility = require('../modules/Utility');
const commandToLoad = [];

module.exports = (client) => {
    const commandFolders = fs.readdirSync('./src/commands');

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../../src/commands/${folder}/${file}`);
            const missingProperties = [];

            if (!command.name) missingProperties.push('name');
            if (!command.description) missingProperties.push('description');
            if (!command.category) missingProperties.push('category');
            if (!Array.isArray(command.options)) missingProperties.push('options (must be an array)');
            if (command.aliases === undefined) missingProperties.push('aliases (optional)');

            if (missingProperties.length > 0) {
                Utility.logMessage("error", `[ Commands ] Missing properties in command: ${file}. Missing: ${missingProperties.join(', ')}`);
            }

            Utility.client.commands.set(command.name, command);
            commandToLoad.push(command);
            Utility.client.ApplicationCommands.push(command);
        } 
    }

    Utility.logMessage("success", `[ Commands ] Loaded ${commandToLoad.length} total commands`);
};
