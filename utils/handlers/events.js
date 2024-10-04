const chalk = require('chalk');
const { Collection } = require('discord.js');
const fs = require('fs')
module.exports = async (client) => {

    const fs = require('fs');
    const folders = fs.readdirSync('./src/events');
    const all = []
    for (const folder of folders) {
        const files = fs.readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith(".js"));

        for (const file of files) {
            const event = require(`../../src/events/${folder}/${file}`);

            if (event.rest) {
                if (event.once)
                    client.rest.once(event.name, (...args) =>
                        event.execute(...args, client)
                    );
                else
                    client.rest.on(event.name, (...args) =>
                        event.execute(...args, client)
                    );
            } else {
                if (event.once)
                    client.once(event.name, (...args) => event.execute(...args, client));
                else client.on(event.name, (...args) => event.execute(...args, client));
            }
            all.push(event)
        }
    }
    console.log(chalk.hex('#7299f8').bold(`[ Events ]`) + chalk.hex('#7299f8').bold(` [ Init ]: ${all.length == 1 ? `${all.length} event` : `${all.length} events`}`))
}