const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'setup',
    async execute(moi, args, client, { type, reply }) {

        const message = await reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: "Setting up the bot ...",
                    color: 'default',
                    description: "> Adding necessary roles and channels, please wait!",
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.botVariables(client)
                    }
                })
            ]
        })

        await Utility.setupBot(moi.guild).then(s => {
            message.edit({
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Setup,
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member),
                            ...Utility.botVariables(client)
                        }
                    })
                ]
            })
        })
    },
    description: "Setup bot to be used in your server",
    category: "management",
    usage: "setup",
    aliases: [],
    options: [],
    cooldown: Utility.cooldown.setup
}