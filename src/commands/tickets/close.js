const Utility = require("../../../utils/modules/Utility");
const { ChannelType } = require('discord.js')
module.exports = {
    name: 'close',
    async execute(moi, args, client, { type, reply }) {

        let reason = type === 'message' ? args.join(' ') : moi.options.getString('reason');
        if (!reason) reason = Utility.messages.No_Reason;

        const { Closed, Not_A_Ticket } = Utility.messages.Close

        const ticekt = await Utility.database.findOne('tickets', { id: moi.channel.id });

        if (!ticekt) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Not_A_Ticket,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.channelVariables(moi.channel, 'ticket'),
                        "link": `https://discord.com/channels/${moi.guild.id}/${moi.channel.id}`
                    }
                })
            ]
        });

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Closed,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.channelVariables(moi.channel, 'ticket'),
                        "link": `https://discord.com/channels/${moi.guild.id}/${moi.channel.id}`
                    }
                })
            ]
        })

        await Utility.database.update('tickets', { closed: Date.now() }, { id: moi.channel.id })

        await Utility.ticketTranscript(moi.channel)

        setTimeout(() => {
            moi.channel.delete({ reason: "Ticket Closed" }).catch(() => { })
        }, 5000);

    },
    description: "Close a support ticket !",
    category: 'tickets',
    aliases: ['closeticket'],
    usage: "close <reason>",
    options: [
        {
            name: "reason",
            description: "The reason for closing the ticket",
            type: 3,
            required: true
        }
    ],
    cooldown: Utility.cooldown.close
}