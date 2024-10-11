const client = require('../../../index.js');
const Utility = require('../../../utils/modules/Utility.js');
const ms = require('ms')
client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot || !message.guild) return;

        const prefix = await Utility.prefix(message.guild).catch(error => {
            Utility.logMessage('error', `Prefix Error: ${error.message}`);
            return;
        });
        if (!prefix) return;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = Utility.client.commands.get(commandName) || Utility.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;

        if (Utility.permission[commandName.toLowerCase()]) {
            if (!Utility.checkPerms(message.member, message.guild, Utility.permission[commandName.toLowerCase()])) {
                return send('message', message, {
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Permission
                        })
                    ]
                }).catch(error => {
                    Utility.logMessage('error', `Send Permission Error: ${error.message}`);
                });
            }
        }

        if (command.cooldown) {
            const cooldown = command.cooldown;
            const cooldownMs = ms(cooldown);
            const userCooldownId = `${message.author.id}_${commandName}`;
            
            const isInDb = await Utility.database.findOne('cooldowns', { id: userCooldownId });
            if (isInDb && isInDb.time - Date.now() > 0) {
                const remainingTime = Math.ceil((isInDb.time - Date.now()) / 1000);
                return message.channel.send({ 
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Cooldown,
                            variables: {
                                "remaining-time": remainingTime,
                                command: command.name,
                                ...Utility.userVariables(message.member),
                                ...Utility.serverVariables(message.guild)
                            }
                        })
                    ] 
                }).catch(error => {
                    Utility.logMessage('error', `Message Send Error (cooldown): ${error.message}`);
                });
            }
            const cooldownExpiration = Date.now() + cooldownMs;
            if (!isInDb) {
                await Utility.database.insert('cooldowns', {
                    id: userCooldownId,
                    time: cooldownExpiration
                });
            } else {
                await Utility.database.update('cooldowns', { time: cooldownExpiration }, { id: userCooldownId });
            }
        }

        await command.execute(message, args, client, { type: 'message', reply: send }).catch(error => {
            Utility.logMessage('error', `Command Execute Error (message): ${error.message}`);
        });
    } catch (error) {
        Utility.logMessage('error', `MessageCreate Event Error: ${error.message}`);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.guild) {
            return interaction.reply({ content: 'Commands are \`Guild Only\` !' }).catch(error => {
                Utility.logMessage('error', `Interaction Reply Error: ${error.message}`);
            });
        }

        const commandName = interaction.commandName;

        const command = Utility.client.commands.get(commandName);
        if (!command) return;

        if (Utility.permission[commandName.toLowerCase()]) {
            if (!Utility.checkPerms(interaction.member, interaction.guild, Utility.permission[commandName.toLowerCase()])) {
                return send('interaction', interaction, {
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Permission
                        })
                    ]
                }).catch(error => {
                    Utility.logMessage('error', `Send Permission Error (interaction): ${error.message}`);
                });
            }
        }

        if (command.cooldown) {
            const cooldown = command.cooldown;
            const cooldownMs = ms(cooldown);
            const userCooldownId = `${interaction.user.id}_${commandName}`;
            
            const isInDb = await Utility.database.findOne('cooldowns', { id: userCooldownId });
            if (isInDb && isInDb.time - Date.now() > 0) {
                const remainingTime = Math.ceil((isInDb.time - Date.now()) / 1000);
                return interaction.reply({ 
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Cooldown,
                            variables: {
                                "remaining-time": remainingTime,
                                command: command.name,
                                ...Utility.userVariables(interaction.member),
                                ...Utility.serverVariables(interaction.guild)
                            }
                        })
                    ] 
                }).catch(error => {
                    Utility.logMessage('error', `Interaction Reply Error (cooldown): ${error.message}`);
                });
            }
            const cooldownExpiration = Date.now() + cooldownMs;
            if (!isInDb) {
                await Utility.database.insert('cooldowns', {
                    id: userCooldownId,
                    time: cooldownExpiration
                });
            } else {
                await Utility.database.update('cooldowns', { time: cooldownExpiration }, { id: userCooldownId });
            }
        }

        await command.execute(
            interaction,
            [],
            client,
            {
                type: 'interaction',
                reply: send
            }
        ).catch(error => {
            Utility.logMessage('error', `Command Execute Error (interaction): ${error.message}`);
        });

    } catch (error) {
        Utility.logMessage('error', `InteractionCreate Event Error: ${error.message}`);
    }
});

async function send(type, moi, data, deffered) {
    return new Promise((resolve, reject) => {
        if (type === 'interaction') {
            if (deffered != true) {
                resolve(moi.reply(data).catch(reject));
            } else if (deffered == true) {
                moi.deferReply().then(() => {
                    resolve(moi.editReply(data).catch(reject));
                }).catch(reject);
            } else {
                resolve(moi.reply(data).catch(reject));
            }
        }
        if (type === 'message') {
            resolve(moi.channel.send(data).catch(reject));
        }
    }).catch(error => {
        Utility.logMessage('error', `Send Function Error: ${error.message}`);
    });
}