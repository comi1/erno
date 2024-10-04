const client = require('../../../index.js');
const Utility = require('../../../utils/modules/Utility.js');

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = await Utility.prefix(message.guild)
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!message.content.startsWith(prefix)) return;

    const command = Utility.client.commands.get(commandName) || Utility.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        if (Utility.permission[commandName.toLowerCase()]) {
            if (!Utility.checkPerms(message.member, message.guild, Utility.permission[commandName.toLowerCase()])) {
                return send('message', message, {
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Permission
                        })
                    ]
                })
            }
        }
        await command.execute(message, args, client, { type: 'message', reply: send });
    } catch (error) {
        Utility.logMessage('error', error.message)
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) {
        return interaction.reply({content: 'Commands are \`Guild Only\` !'})
    }

    const commandName = interaction.commandName;

    const command = Utility.client.commands.get(commandName);
    if (!command) return;

    try {
        if (Utility.permission[commandName.toLowerCase()]) {
            if (!Utility.checkPerms(interaction.member, interaction.guild, Utility.permission[commandName.toLowerCase()])) {
                return send('interaction', interaction, {
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Permission
                        })
                    ]
                })
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
        );

    } catch (error) {
        Utility.logMessage('error', error.message)
    }
});

async function send(type, moi, data, deffered) {
    return new Promise((resolve, reject) => {
        if (type === 'interaction') {
            if (deffered != true) {
                resolve(moi.reply(data));
            } else if (deffered == true) {
                moi.deferReply().then(() => {
                    resolve(moi.editReply(data));
                }).catch(reject);
            } else {
                resolve(moi.reply(data));
            }
        }
        if (type === 'message') {
            resolve(moi.channel.send(data));
        }
    });
}
