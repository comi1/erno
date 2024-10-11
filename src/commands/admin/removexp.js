const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: "removexp",
    async execute(moi, args, client, { type, reply }) {

        const user = await Utility.getUser(moi, type, args[0]);
        const amount = type == 'message' ? args[1] : moi.options.getInteger('amount');

        if (!user || isNaN(amount) || amount <= 0) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Usage,
                    variables: {
                        usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                    }
                })
            ]
        });

        const member = await moi.guild.members.fetch(user.id).catch(() => { null });
        if (!member) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Usage,
                    variables: {
                        usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                    }
                })
            ]
        });

        await removeXp(user, amount).then(s => {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.XpRemove,
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(member),
                            amount: amount,
                            level: s.level,
                            xp: s.next_level_exp
                        }
                    })
                ]
            });
        });

    },
    aliases: ["takeexp", "subtractexp"],
    usage: "removexp <user> <amount>",
    category: "admin",
    description: "Remove experience points from a user.",
    options: [
        {
            name: "user",
            type: 6,
            description: "The user to remove experience points from.",
            required: true
        },
        {
            name: "amount",
            type: 4,
            description: "The amount of experience points to remove.",
            required: true
        }
    ],
    cooldown: Utility.cooldown.removexp
};

async function removeXp(user, amount) {
    let userHasLevelData = await Utility.database.findOne('level', { id: user.id });

    if (!userHasLevelData) {
        return { error: 'User has no level data.' };
    }

    const currentLevel = userHasLevelData.level;
    const nextLevelXp = userHasLevelData.next_level_exp;
    let newXp = userHasLevelData.exp - amount;

    if (newXp < 0 && currentLevel > 0) {
        const newLevel = currentLevel - 1;
        const previousNextLevelXp = parseInt((newLevel) * 78 + 78);
        newXp = previousNextLevelXp + newXp;

        await Utility.database.update('level', {
            level: newLevel,
            next_level_exp: previousNextLevelXp
        }, { id: user.id });

        return {
            level: newLevel,
            next_level_exp: previousNextLevelXp
        };
    } else if (newXp < 0 && currentLevel === 0) {
        newXp = 0;
    }

    await Utility.database.update('level', { exp: newXp }, { id: user.id });
    return {
        level: currentLevel,
        next_level_exp: nextLevelXp
    };
}
