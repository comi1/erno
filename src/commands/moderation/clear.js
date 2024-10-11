const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'clear',
    aliases: ['purge'],
    async execute(moi, args, client, { type, reply }) {

        const amount = type === 'message' ? args[0] : moi.options.getInteger('amount');
        if (!amount || isNaN(amount) || amount <= 0 || amount > 100) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Usage,
                    variables: {
                        usage: `${await Utility.prefix(moi.guild)}clear [amount]`
                    }
                })
            ]
        }, true)

        try {
            let newAmount;

            if (amount == 100) newAmount = amount
            else newAmount = parseInt(amount) + 1;

            const fetchedMessages = await moi.channel.messages.fetch({ limit: newAmount });
            await moi.channel.bulkDelete(fetchedMessages);

            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Clear.Success,
                        variables: {
                            amount: fetchedMessages.size,
                            ...Utility.userVariables(moi.member),
                            ...Utility.channelVariables(moi.channel)
                        }
                    })
                ]
            }, true).then(msg => {
                setTimeout(() => {
                    msg.delete().catch((e) => { })
                }, 3000);
            })
        } catch (error) {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Clear.Unable_to_clear,
                        variables: {
                            ...Utility.userVariables(moi.member),
                            ...Utility.channelVariables(moi.channel)
                        }
                    })
                ]
            }, true)
        }

    },
    description: 'Clear messages in the chat!',
    category: 'moderation',
    options: [
        {
            name: 'amount',
            description: 'The number of messages to delete.',
            type: 4,
            required: true,
        },
    ],
    cooldown: Utility.cooldown.clear
}