const Utility = require("../../../utils/modules/Utility")

module.exports = {
    name: 'userinfo',
    aliases: ['user'],
    async execute (moi, args, client, { type, reply}) {

        const user = await Utility.getUser(moi, type, args[0]) || moi.member.user;
        const userLevel = await Utility.database.findOne('level', { id: user.id });
        let levelInfo = userLevel ? { exp, level, next_level_exp } = userLevel : { exp: 0, level:0, next_level_exp:0 }
        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Userinfo,
                    variables: {
                        "user_id": user.id,
                        "user_username": user.username,
                        "user_avatar": user.displayAvatarURL({ size: 2048 }),
                        "created_at": user.createdAt.toLocaleString(),
                        "bot": user.bot,
                        "level": levelInfo.level,
                        "exp" : levelInfo.exp,
                        "progressExp": `${levelInfo.exp}/${levelInfo.next_level_exp}`,
                    }
                })
            ]
        })

    },
    description: 'Display information about the user or yourself.',
    category: 'utils',
    options: [
        {
            name: 'user',
            description: 'The user whose information you want to retrieve.',
            type: 6,
            required: true
        }
    ]
}