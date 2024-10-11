const Utility = require("../../../utils/modules/Utility");
const { ChannelType } = require('discord.js')
module.exports = {
    name: 'new',
    async execute(moi, args, client, { type, reply }) {

        let reason = type === 'message' ? args.join(' ') : moi.options.getString('reason');
        if (!reason) reason = Utility.messages.No_Reason;

        const { Name, Category, Staff, MentionUser, MentionStaff, Buttons } = Utility.config.Tickets;
        const { Open, Missing, TicketMessageEmmbed } = Utility.messages.New

        const toCreateCategory = Utility.findChannel(moi.guild, Category);
        if (!toCreateCategory || toCreateCategory.type !== ChannelType.GuildCategory) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Missing, 
                        variables: {
                            type: "Channel",
                            missing: `${Category}`,
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member)
                        }
                    })
                ]
            });
        }

        await moi.guild.channels.create({
            name: `${Utility.replaceVariables(Name, { ...Utility.userVariables(moi.member), ...Utility.serverVariables(moi.guild)})}`,
            type: ChannelType.Text,
            parent: toCreateCategory.id,
            permissionOverwrites: [
                {
                    id: moi.guild.id,
                    deny: ['ViewChannel']
                },
                {
                    id: moi.member.user.id,
                    allow: ['ViewChannel']
                }
            ]
        }).then(async c => {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Open,
                        variables: {
                            ...Utility.userVariables(moi.member),
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.channelVariables(c, 'ticket'),
                            "link": `https://discord.com/channels/${moi.guild.id}/${c.id}`
                        }
                    })
                ]
            });

            let ticketMessage = '';
            let ids = [];
            if (MentionUser) ticketMessage += `<@${moi.member.user.id}>, `
            if (MentionStaff) {
                for (const rol of Staff) {
                    const staffRoles = await moi.guild.roles.cache.find(r => r.name == rol) || moi.guild.roles.cache.get(rol);
                    if (staffRoles) {
                        ticketMessage += `<@&${staffRoles.id}> `
                        ids.push(staffRoles.id);
                    }
                }
            }

            ids.forEach(id => {
                c.permissionOverwrites.edit(id, {
                    ViewChannel: true,
                    SendMessages: true,
                    EmbedLinks: true,
                    AddReactions: true
                })
            })

            c.send({content: ticketMessage, embeds: [
                Utility.embed({
                    ...TicketMessageEmmbed,
                    variables: {
                        ...Utility.userVariables(moi.member),
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.channelVariables(c, 'ticket'),
                        "link": `https://discord.com/channels/${moi.guild.id}/${c.id}`
                    }
                })
            ]});

            Utility.database.insert('tickets', { id: c.id, guild: moi.guild.id, cretor: moi.member.user.id, staff: JSON.stringify(Staff), reason: reason, creted: Date.now(), closed: 0})
        })
    },
    description: "Create a support ticket !",
    category: 'tickets',
    aliases: ['ticket'],
    usage: "new [reason]",
    options: [
        {
            name: "reason",
            description: "The reason for creating the ticket",
            type: 3,
            required: true
        }
    ],
    cooldown: Utility.cooldown.new
}