const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {

        if (message.author.bot || message.system) return;

        const xp_to_add = Math.floor(Math.random() * 10) + 1;
        let hasLevel = await Utility.database.findOne('level', { id: message.author.id });

        if (!hasLevel) {
            hasLevel = {
                id: message.author.id,
                level: 0,
                exp: xp_to_add,
                next_level_xp: 78
            };
            await Utility.database.insert('level', hasLevel);
            return;
        }

        const nextLevelXp = hasLevel.next_level_exp;
        let newXp = hasLevel.exp + xp_to_add;


        if (newXp >= nextLevelXp) {
            const newLevel = hasLevel.level + 1;
            await rewardUser(message.member, newLevel)
            const updatedNextLevelXp = parseInt(newLevel * 78 + hasLevel.next_level_exp)

            await Utility.database.update('level', {
                level: newLevel,
                exp: 0,
                next_level_exp: updatedNextLevelXp
            }, { id: message.author.id });

            message.channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Levelup,
                        variables: {
                            level: newLevel,
                            ...Utility.serverVariables(message.guild),
                            ...Utility.userVariables(message.member)
                        }
                    })
                ]
            })
        } else {
            await Utility.database.update('level', { exp: newXp }, { id: message.author.id });
        }
    }
};

async function rewardUser(member, reward) {
    const rewards = Utility.rewards;
    const levelRewards = rewards.Level;

    if (levelRewards[reward]) {
        const { amount, type } = levelRewards[reward];
        
        if(type == 'coins') {
            const hasCoins = await Utility.database.findOne('coins', { id: member.user.id });
            if(!hasCoins) {
                coins_data = {
                    id:  member.user.id,
                    balance: 0,
                    bank: amount
                };
                await Utility.database.insert('coins', coins_data);
                return;
            } else {
                const newBalance = hasCoins.bank + amount;
                await Utility.database.update('coins', { bank: newBalance }, { id:  member.user.id });
                return;
            }
        } 

        if (type == 'role') {
            const role = amount;
            const role_exists = await member.guild.roles.cache.find(r => r.name == role) || member.guild.roles.cache.get(role);
            if (role_exists) {
                await member.roles.add(role_exists);
                return;
            } else {
                Utility.logMessage('info', `[ Leveling Rewards ] The role "${role}" does not exist in the server.`)
                return;
            }
        }

    }
}
