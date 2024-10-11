const Utility = require("../../../utils/modules/Utility");
const { PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'adduser',
    async execute(moi, args, client, { type, reply }) {

        const user = await Utility.getUser(moi, type, args[0]);
        if (!user) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Usage,
                    variables: {
                        usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                    }
                })
            ]
        });

        const ticket = await Utility.database.findOne('tickets', { id: moi.channel.id });
        if (!ticket) return reply(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.messages.Adduser.Not_A_Ticket,
                    variables: {
                       ...Utility.serverVariables(moi.guild),
                    }
                })
            ]
        })

        const member = await moi.guild.members.fetch(user.id).catch(() => { null })
        const hasAccess = moi.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel);
        if (hasAccess) return reply(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.messages.Adduser.User_Already_In_Ticket,
                    variables: {
                       ...Utility.serverVariables(moi.guild),
                       ...Utility.userVariables(member),
                       "link": `https://discord.com/channels/${moi.guild.id}/${moi.channel.id}`
                    }
                })
            ]
        })

        reply(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.messages.Adduser.Added_To_Ticket,
                    variables: {
                       ...Utility.serverVariables(moi.guild),
                       ...Utility.userVariables(member),
                       "link": `https://discord.com/channels/${moi.guild.id}/${moi.channel.id}`
                    }
                })
            ]
        })
        
        moi.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            EmbedLinks: true,
            AddReactions: true
        })

    },
    description: "Add a user to the ticket !",
    category: 'support',
    aliases: ['useradd'],
    usage: 'adduser <user>',
    options: [
        {
            name: 'user',
            description: 'The user to add to the ticket',
            type: 6,
            required: true
        }
    ],
    cooldown: Utility.cooldown.adduser
}