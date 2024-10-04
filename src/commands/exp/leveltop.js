const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'leveltop',
    aliases: ['exptop'],

    async execute(moi, args, client, { type, reply }) {

        const toSort = await Utility.database.findAll('level');
        const sorted = Utility.sort(toSort, 'desc', 'level',  10);

        if (!sorted.length) return reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Leveltop.Embed,
                    variables: {
                        formatedData: 'None',
                        ...Utility.serverVariables(moi.guild)
                    }
                })
            ]
        });
        let formatedString = ''

        sorted.map((c, i) => {
            formatedString += `${Utility.messages.Leveltop.format.replace(/{user-mention}/g, `<@${c.id}>`).replace(/{level}/g, c.level).replace(/{exp}/g, c.exp).replace(/{nextLevelExp}/g, c.next_level_exp).replace(/{position}/g, i + 1)}\n`
        }) 

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Leveltop.Embed,
                    variables: {
                        formatedData: formatedString,
                        ...Utility.serverVariables(moi.guild)
                    }
                })
            ]
        })
    },
    description: 'Displays the top players based on their level !',
    category: 'exp',
}