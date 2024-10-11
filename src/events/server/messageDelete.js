const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message, client) {

        if (!message.guild) return;
        if (!message.content) return;

        const logChannel = await Utility.findChannel(message.guild, Utility.config.MessageDelete);
        if (!logChannel) return;

        const time = `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()} - ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
        logChannel.send({
            embeds: [
                Utility.embed({
                    ...Utility.messages.Logs.MessageDelete,
                    variables: {
                        ...Utility.userVariables(message.member),
                        ...Utility.serverVariables(message.guild),
                        ...Utility.channelVariables(message.channel),
                        content: message.content?.substring(0, 1000),
                        "date-time": time
                    }
                })
            ]
        })
    }
}