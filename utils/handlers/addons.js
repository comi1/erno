const Utility = require("../modules/Utility");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
let addonEvents = {}
module.exports = async (client) => {

    const addonsDir = path.resolve('./addons'); 
    const addonFiles = fs.readdirSync(addonsDir);

    if (addonFiles.length === 0) {
        return Utility.logMessage("success", "[ Addons ] There are no addons to load!");
    }

    addonFiles.forEach(async file => {
        if (file.endsWith('.js')) {
            try {
                const addon = require(path.join(addonsDir, file));
                const { commands, events, execute, messages } = addon;

                if (Array.isArray(commands)) {
                    commands.forEach(command => {
                        if (!Utility.client.commands.has(command.name)) {
                            Utility.client.commands.set(command.name, command);
                            Utility.client.ApplicationCommands.push(command);
                        }
                    });
                }

                if (Array.isArray(events)) {
                    events.forEach(event => {
                        const eventId = event.id || uuidv4();

                        if (addonEvents[eventId]) {
                            throw new Error(`Event ID ${eventId} is not unique for event ${event.name}`);
                        }

                        addonEvents[eventId] = event;

                        if (event.rest) {
                            if (event.once) {
                                client.rest.once(event.name, (...args) => event.execute(...args, client));
                            } else {
                                client.rest.on(event.name, (...args) => event.execute(...args, client));
                            }
                        } else {
                            if (event.once) {
                                client.once(event.name, (...args) => event.execute(...args, client));
                            } else {
                                client.on(event.name, (...args) => event.execute(...args, client));
                            }
                        }
                    });
                }

                if (execute) {
                    await execute(client);
                }

                if (messages && typeof messages == 'object') {
                    if (messages.load && typeof messages.load == 'string') {
                        console.log(messages.load);
                    }
                }
            } catch (error) {
                Utility.logMessage("error", `[ Addons ] Error loading addon ${file}: ${error.message}`);
            }
        }
    });
};
