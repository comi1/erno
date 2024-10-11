const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: "serverinfo",
    aliases: ['server'],
    async execute(moi, args, client, { type, reply }) {
        await reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Serverinfo,
                    variables: {
                        ...Utility.serverVariables(moi.guild)
                    }
                })
            ]
        })
    },
    description: "Displays information about the current server.",
    category: 'utils',
    options: [],
    cooldown: Utility.cooldown.serverinfo
}