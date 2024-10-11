const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: "avatar",
    async execute(moi, args, client, { type, reply }) {

        let user = await Utility.getUser(moi, type, args[0])
        if (!user) user = moi.member.user;

        const member = await moi.guild.members.fetch(user.id).catch(() => { null });

        if (!member) return reply(type, moi, { embeds: [
            Utility.embed({
                title: "User not found",
                description: "I couldn't find that user in the server.",
                color: 'error',
                timestamp: true
            })
        ]}, true);

        await reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Avatar,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(member),
                    }
                })
            ]
        }, true);
    },
    description: "Get the user avatar!",
    usage: "avatar <user>",
    aliases: ["pfp", "av"],
    category: 'utils',
    options: [
        {
            name: "user",
            type: 6,
            description: "The user whose avatar you want to see.",
            required: false
        }
    ],
    cooldown: Utility.cooldown.avatar
}