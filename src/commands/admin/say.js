const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'say',
    async execute(moi, args, client, { type, reply }) {
        const message = type === 'message' ? args.join(' ') : moi.options.getString('message');
        if (!message) {
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

        const roleMentions = message.match(/<@&\d+>/g) || [];
        const content = (message.includes('@everyone') ? '@everyone' : '') || 
                        (message.includes('@here') ? '@here' : '') || 
                        roleMentions.join(' ');

        await moi.channel.send({
            content: content,
            embeds: [
                Utility.embed({
                    ...Utility.messages.Say.Embed,
                    variables: {
                        ...Utility.userVariables(moi.member),
                        ...Utility.serverVariables(moi.guild),
                        content: message.replace(/@everyone/g, '').replace(/@here/g, '').replace(/<@&\d+>/g, '')
                    }
                })
            ]
        });

        const msg = await reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Say.Sent,
                    variables: {
                        ...Utility.userVariables(moi.member),
                        ...Utility.serverVariables(moi.guild),
                        content: message,
                    }
                })
            ]
        }, true)

        setTimeout(() => {
            msg.delete().catch(() => { })
        }, 1500);

        if (type == 'message') moi.delete().catch(() => { })
    },
    description: 'Make the bot say something, including role mentions.',
    aliases: ['echo'],
    usage: 'say [message]',
    category: 'admin',
    options: [
        {
            name: 'message',
            description: 'The message you want the bot to say.',
            type: 3,
            required: true
        }
    ]
}
