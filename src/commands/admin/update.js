const Utility = require("../../../utils/modules/Utility")

module.exports = {
    name: 'update',
    async execute(moi, args, client, { type, reply }) {

        const version = require("../../../package.json").version;
        if (!version) return reply(type, moi, { content: 'Failed to fetch bot version.' });

        const newVersion = 'V1.0.5'

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: 'Bot Update',
                    description: `Erno Bot has been updated from  ${version} ➜ ${newVersion}`,
                    timestamp: new Date(),
                    color: 'default',
                })
            ]
        })



    },
    aliases: ['upgrade'],
    usage: 'update',
    description: 'Updates the bot to the latest version.',
    category: 'admin',
    options: []
}
