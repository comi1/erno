const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'level',
    async execute(moi, args, client, { type, reply }) {
        const user = await Utility.getUser(moi, type, args[0]) || moi.member.user;
        const member = await moi.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}level [user]`
                        }
                    })
                ]
            }, true);
        }

        const level = await Utility.database.findOne('level', { id: user.id });
        if (!level) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Level.NoLevel,
                        variables: {
                            ...Utility.userVariables(member)
                        }
                    })
                ]
            }, true);
        }

        const currentLevel = level.level;
        const exp = level.exp;
        const neededExp = level.next_level_exp - exp;


        const progressPercentage = ((exp / level.next_level_exp) * 100).toFixed(2);
        const progressBar = getProgressBar(progressPercentage);

        const fixedText = Utility.messages.Level.LevelMessage
            .replace(/{user-username}/g, member.user.username)
            .replace(/{level}/g, currentLevel)
            .replace(/{exp}/g, exp)
            .replace(/{neededExp}/g, neededExp)
            .replace(/{progress}/g, progressBar);

        const attachment = await Utility.createLevelCard(
            member.user.username,
            member.user.displayAvatarURL({ extension: 'png', size: 512 }),
            fixedText,
            progressBar.toString()
        );

        reply(type, moi, {
            files: [attachment]
        }, true);
    },
    aliases: ['xp', 'rank'],
    description: 'Displays the current level and XP of the user.',
    category: 'exp',
    options: [
        {
            name: 'user',
            description: 'Specify a user to get their level and XP.',
            type: 6,
            required: false
        }
    ],
    cooldown: Utility.cooldown.level
};

function getProgressBar(progress, totalWidth = 20) {
    if (progress < 0) {
        progress = 0;
    } else if (progress > 100) {
        progress = 100;
    }

    const filledLength = Math.round((progress / 100) * totalWidth);
    const filled = '🟩'.repeat(filledLength);
    const empty = '⬜'.repeat(totalWidth - filledLength);
    return filled + empty;
}
