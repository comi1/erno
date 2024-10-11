const client = require("../../../index");
const Utility = require("../../../utils/modules/Utility");
module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage, newMessage) {

        if (!oldMessage.guild || !newMessage.guild) return;
        if (!oldMessage.content || !newMessage.content) return;
        if (oldMessage.content === newMessage.content) return;

        const logChannel = await Utility.findChannel(oldMessage.guild, Utility.config.MessageDelete);
        if (!logChannel) return;

        const time = `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()} - ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;

        const isAdvertisement = await Utility.checkForAdvertisement(newMessage);
            if (isAdvertisement) {
                await newMessage.delete().catch(() => { });
            
                newMessage.channel.send({
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Logs.AdvertisementDetected,
                            variables: {
                                ...Utility.userVariables(newMessage.member),
                                ...Utility.serverVariables(newMessage.guild),
                                ...Utility.channelVariables(newMessage.channel),
                                "old-content": oldMessage.content?.substring(0, 1000),
                                "new-content": newMessage.content?.substring(0, 1000),
                                "date-time": time
                            }
                        })
                    ]
                }).catch(() => { });
                try {
                    await Utility.updatePunishments(newMessage.author, {
                        type: 'advertisement',
                        reason: 'Detected advertisement',
                        duration: 0,
                        date: Date.now(),
                        staff: client.user.id
                    });
                } catch (error) {
                    Utility.logMessage('error', `Punishment update error: ${error.message}`);
                }
                return;
            }
            

        return logChannel.send({
            embeds: [
                Utility.embed({
                    ...Utility.messages.Logs.MessageUpdate,
                    variables: {
                        ...Utility.userVariables(newMessage.member),
                        ...Utility.serverVariables(newMessage.guild),
                        ...Utility.channelVariables(newMessage.channel),
                        "old-content": oldMessage.content?.substring(0, 1000),
                        "new-content": newMessage.content?.substring(0, 1000),
                        "date-time": time
                    }
                })
            ]
        }).catch(() => { });
    }
}
