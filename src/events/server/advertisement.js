const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {

        if (message.author.bot || !message.guild) return;
        const isAdvertisement = await Utility.checkForAdvertisement(message);
        if (isAdvertisement) {
            try {
                await message.delete();
                const time = `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()} - ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;

                await message.channel.send({
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Logs.AdvertisementDetected,
                            variables: {
                                ...Utility.userVariables(message.member),
                                ...Utility.serverVariables(message.guild),
                                ...Utility.channelVariables(message.channel),
                                "content": message.content?.substring(0, 1000),
                                "date-time": time
                            }
                        })
                    ]
                });
                await Utility.updatePunishments(message.author, {
                    type: 'advertisement',
                    reason: 'Detected advertisement',
                    duration: 0,
                    date: Date.now(),
                    staff: client.user.id
                })
            } catch (error) {
                Utility.logMessage('error', `Advertisement handling error: ${error.message}`);
            }
            return;
        }
    }
}
