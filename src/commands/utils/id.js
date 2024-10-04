const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'id',
    async execute(moi, args, client, { type, reply }) {
        const mention = type === 'message' ? args[0] : moi.options.getString('mention');

        if (!mention) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                        }
                    })
                ]
            });
        }

        let mentionType;
        if (mention.startsWith('<#') && mention.endsWith('>')) mentionType = 'channel';
        if (mention.startsWith('<@') && mention.endsWith('>')) mentionType = 'user';
        if (mention.startsWith('<@&') && mention.endsWith('>')) mentionType = 'role';
            
        if (!mentionType) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "Invalid Mention",
                        description: "Please provide a valid user, role, or channel mention.",
                        color: 'error',
                        timestamp: true
                    })
                ]
            });
        }

        let target;
        switch (mentionType) {
            case 'channel':
                target = client.channels.cache.get(mention.replace(/<#|>/g, ''));
                break;
            case 'user':
                target = client.users.cache.get(mention.replace(/<@!?|>/g, ''));
                break;
            case 'role':
                target = moi.guild.roles.cache.get(mention.replace(/<@&|>/g, '')); 
                break;
        }

        if (!target) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: `${mentionType.charAt(0).toUpperCase() + mentionType.slice(1)} Not Found`,
                        description: "The specified user, role, or channel could not be found.",
                        color: 'error',
                        timestamp: true
                    })
                ]
            });
        }

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Id,
                    fields: [
                        {
                            name: `${mentionType.charAt(0).toUpperCase() + mentionType.slice(1)} ID`,
                            value: target.id
                        }
                    ],
                    variables: {
                        ...Utility.serverVariables(moi.guild)
                    }
                })
            ]
        });
    },
    description: "Get the ID of the user, role, or channel.",
    category: 'utils',
    usage: "id <@mention>",
    aliases: ['getid'],
    options: [
        {
            name: 'mention',
            description: 'Mention a user, role, or channel.',
            type: 3, // STRING type
            required: true,
        }
    ]
};
