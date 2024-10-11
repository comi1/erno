const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'history',
    async execute(moi, args, client, { type, reply }) {

        const user = await Utility.getUser(moi, type, args[0]);
        if (!user) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Usage,
                    variables: {
                        usage: `${await Utility.prefix(moi.guild)}history [user]`
                    }
                })
            ]
        }, true)
        
        const history = await Utility.getPunishments(user);
        const member = await moi.guild.members.fetch(user.id).catch((e) => { null });

        if (!member) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.MissingMember,
                    variables: {
                        "user-username": user.username,
                        "user-id": user.id,
                        "user-mention": `<@${user.id}>`
                    }
                })
            ]
        });

        if (!history.length) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: Utility.messages.History.NoHistory,
                        color: 'error',
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(member)
                        }
                    })
                ]
            });
        }

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.History.History,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(member),
                        history: `${history.map((u, i) => `**ID: ${i + 1}**\n**Staff:** <@${u.staff}> (${u.staff})\n **Reason:** ${u.reason}\n**Duration:** ${u.duration == 0 ? 'Lifetime' : u.duration}`).join("\n\n")}`
                    }
                })
            ]
        });

    },
    description: "View punishment history!",
    usage: "history [user]",
    aliases: ['punishments', 'punishmentlog'],
    category: 'moderation',
    options: [
        {
            name: 'user',
            type: 6,
            description: 'The user whose history you want to view.',
            required: true
        }
    ],
    cooldown: Utility.cooldown.history
}