const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'boosters',
    async execute(moi, args, client, { type, reply }) {

        const members = await moi.guild.members.fetch();
        const boosters = members.filter(member => member.premiumSince).map(member => {
            return {
                user: member.id,
                boostedOn: `<t:${~~(member.premiumSince.getTime() / 1000)}:R>`
            };
        })

        if (!boosters.length) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Boosters.Embed,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        boosters: Utility.messages.Boosters.No_Boosters
                    }
                })
            ]
        });

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Boosters.Embed,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        boosters: boosters.map(booster => `**${client.users.cache.get(booster.user)?.username}** - Boosted on ${booster.boostedOn}`).join('\n')
                    }
                })
            ]
        });


    },
    description: "Returns the current boosters in the server.",
    usage: "boosters",
    category: 'other',
    aliases: ['boost'],
    options: []
}