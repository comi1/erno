const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'ping',
    aliases: [],
    async execute(moi, args, client, { type,  reply}) {

        const latency = Math.round(client.ws.ping)
        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Ping,
                    variables: {
                        latency: latency
                    }
                })
            ]
        })
    },
    description: 'Check the bot\'s latency.',
    category: 'utils',
    options: []
}