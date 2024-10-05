const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'ping',
    aliases: [],
    async execute(moi, args, client, { type, reply }) {
        // Initialize the latency variable
        let latency = '';

        // Send initial reply
        const message = await reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Ping,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.botVariables(client),
                    }
                })
            ]
        }, true);

        await message.edit({
            embeds: [
                Utility.embed({
                    ...Utility.messages.Ping,
                    fields: [
                        {
                            name: "Websocket",
                            value: `${Math.round(client.ws.ping)}ms`,
                            inline: true
                        },
                        {
                            name: "Response",
                            value: `${message.createdTimestamp - moi.createdTimestamp}ms`,
                            inline: true
                        }
                    ],
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.botVariables(client),
                    }
                })
            ]
        });
    },
    description: 'Check the bot\'s latency.',
    category: 'utils',
    options: []
};
