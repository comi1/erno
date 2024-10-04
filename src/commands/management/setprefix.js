const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'setprefix',
    aliases: ['prefix'],
    async execute(moi, args, client, { type, reply }) {

        const newPrefix = type == 'message' ? args[0] : moi.options.getString('prefix');
        if (!newPrefix) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}setprefix [prefix]`
                        }
                    })
                ]
            }, true)
        }

        const currentPrefix = await Utility.database.findOne('prefix', { id: moi.guild.id });
        if (!currentPrefix) {
            await Utility.database.insert('prefix', { id: moi.guild.id, prefix: newPrefix });
        } else {
            await Utility.database.update('prefix', { prefix: newPrefix }, { id: moi.guild.id });
        }

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Prefix,
                    variables: {
                        prefix: newPrefix,
                        ...Utility.serverVariables(moi.guild)
                    }
                })
            ]
        })

    },
    description: 'Change the prefix for your bot.',
    category: 'management',
    options: [
        {
            name: 'prefix',
            description: 'The new prefix for your bot.',
            type: 3,
            required: true,
        }
    ]
}