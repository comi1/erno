const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'kick',
    async execute(moi, args, client, { type, reply }) {

        const user = await Utility.getUser(moi, type, args[0]);
        const reason = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('reason') || 'No reason provided.'

        if (!user) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}kick [user] [reason]`
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
                            usage: `${await Utility.prefix(moi.guild)}kick [user] [reason]`
                        }
                    })
                ]
            })
        }

        if (user.id == moi.guild.ownerId) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Kick.Staff_Member,
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
                        ...Utility.messages.Kick.Higher_Staff,
                        variables: {
                            ...Utility.userVariables(member),
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member, 'staff'),
                        }
                    })
                ]
            })
        }

        if (Utility.checkPerms(member, moi.guild, Utility.permission.kick_protected)) {
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
        
        await member.kick({ reason: reason })
        
        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Kick.Success,
                    variables: {
                        ...Utility.userVariables(member),
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member, 'staff'),
                        reason
                    }
                })
            ]
        })
    },
    aliases: ['k'],
    description: 'Kicks a user from the server.',
    category: 'moderation',
    options: [
        {
            name: 'user',
            description: 'The user to kick.',
            type: 6,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason for kicking the user.',
            type: 3,
            required: false
        }
    ]
}