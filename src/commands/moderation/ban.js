const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'ban',
    async execute(moi, args, client, { type, reply }) {

        const user = await Utility.getUser(moi, type, args[0]);
        const reason = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('reason') || 'No reason provided.'

        if (!user) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}ban [user] [reason]`
                        }
                    })
                ]
            })
        }

        const member = await moi.guild.members.fetch(user.id).catch(() => { null });

        if (!member) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}ban [user] [reason]`
                        }
                    })
                ]
            })
        }

        if (user.id == moi.guild.ownerId) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Ban.Staff_Member,
                        variables: {
                            ...Utility.userVariables(member),
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member, 'staff'),
                            
                        }
                    })
                ]
            })
        }

        if (member.roles.highest.position >= moi.member.roles.highest.position) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Ban.Higher_Staff,
                        variables: {
                            ...Utility.userVariables(member),
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member, 'staff'),
                        }
                    })
                ]
            })
        }

        if (Utility.checkPerms(member, moi.guild, Utility.permission.ban_protected)) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Ban.Staff_Member,
                        variables: {
                            ...Utility.userVariables(member),
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member, 'staff'),                  
                        }
                    })
                ]
            })
        }
        
        await member.ban({ reason: reason })
        
        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Ban.Success,
                    variables: {
                        ...Utility.userVariables(member),
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member, 'staff'),
                        reason
                    }
                })
            ]
        })

        await Utility.updatePunishments(user, {
            type: 'ban',
            reason: reason,
            duration: 0,
            date: Date.now(),
            staff: moi.member.user.id
        })
    },
    aliases: ['b'],
    description: 'Bans a user from the server.',
    category: 'moderation',
    options: [
        {
            name: 'user',
            description: 'The user to ban.',
            type: 6,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason for banning the user.',
            type: 3,
            required: false
        }
    ],
    cooldown: Utility.cooldown.ban
}