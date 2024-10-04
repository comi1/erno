const Utility = require("../../../utils/modules/Utility")

module.exports = {
    name: "givexp",
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
        })

        await addXp(user, amount).then(s => {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.XpAdd,
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
        })

    },
    aliases: ["giveexp", "addexp"],
    usage: "givexp <user> <amount>",
    category: "admin",
    description: "Give a user experience points.",
    options: [
        {
            name: "user",
            type: 6,
            description: "The user to give experience points to.",
            required: true
        },
        {
            name: "amount",
            type: 4,
            description: "The amount of experience points to give.",
            required: true
        }
    ],
}

async function addXp(user, amount) {
    let userHasLevelData = await Utility.database.findOne('level', { id: user.id });
    
    if (!userHasLevelData) {
        userHasLevelData = {
            id: user.id,
            level: 0,
            exp: amount,
            next_level_exp: 78
        };
        await Utility.database.insert('level', userHasLevelData);
        return userHasLevelData;
    }

    const currentLevel = userHasLevelData.level;
    const nextLevelXp = userHasLevelData.next_level_exp;
    let newXp = userHasLevelData.exp + amount;

    if (newXp >= nextLevelXp) {
        const newLevel = currentLevel + 1;  
        newXp -= nextLevelXp;

        const updatedNextLevelXp = parseInt(newLevel * 78 + nextLevelXp);

        await Utility.database.update('level', {
            level: newLevel,
            next_level_exp: updatedNextLevelXp
        }, { id: user.id });

        return {
            level: newLevel,
            next_level_exp: updatedNextLevelXp
        };
    } else {
        await Utility.database.update('level', { exp: newXp }, { id: user.id });
        return {
            level: currentLevel,
            exp: newXp,
            next_level_exp: nextLevelXp
        };
    }
}
