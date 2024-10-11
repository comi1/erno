const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'forceban',
    async execute(moi, args, client, { type, reply }) {

        const id = type == 'message' ? args[0] : moi.options.getString('userid');
        const reason = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('reason');

        if (!id || isNaN(id)) {
            return await reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                        }
                    })
                ]
            }, true);
        }

        try {
            const user = await client.users.fetch(id).catch(() => null);
            if (!user) {
                return await reply(type, moi, {
                    embeds: [
                        Utility.embed({
                            title: 'Error',
                            description: 'User not found, check the ID.',
                            color: "error",
                            timestamp: true
                        })
                    ]
                }, true);
            }

            const member = await moi.guild.members.fetch(id).catch((e) => { null })

            if (member && Utility.checkPerms(member, moi.guild, Utility.permission.ban_protected)) {
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

            const bans = await moi.guild.bans.fetch();
            const isBanned = bans.has(id);

            if (isBanned) {
                return await reply(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Forceban.AlredyBanned,
                            variables: {
                                "user-mention": `<@${user.id}>`,
                                "user-id": user.id,
                                "user-username": user.username,
                                "user-pfp": user.displayAvatarURL({ size: 1024 }),
                                "reason": reason ? reason : "No reason provided",
                                ...Utility.serverVariables(moi.guild),
                                ...Utility.userVariables(moi.member, 'staff')
                            }
                        })
                    ]
                }, true);
            }

            await moi.guild.bans.create(id, { reason: reason ? reason : "No reason provided" })

            await reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Forceban.Success,
                        variables: {
                            "user-mention": `<@${user.id}>`,
                            "user-id": user.id,
                            "user-username": user.username,
                            "user-pfp": user.displayAvatarURL({ size: 1024 }),
                            "reason": reason ? reason : "No reason provided",
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member, 'staff')
                        }
                    })
                ]
            }, true); 

        } catch (error) {
            console.error(error);
            await reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: 'Error',
                        description: error.message,
                        color: "error",
                        timestamp: true
                    })
                ]
            });
        }
    },
    description: "Forceban a member",
    category: 'moderation',
    usage: 'forceban [userid] [reason]',
    aliases: ['fb'],
    options: [
        {
            name: 'userid',
            description: 'The user ID to forceban',
            type: 3,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason for the ban',
            type: 3,
            required: false
        }
    ],
    cooldown: Utility.cooldown.forceban
};
