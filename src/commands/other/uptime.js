const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'uptime',
    async execute(moi, args, client, { type, reply }) {

        const uptime = formatUptime(Math.floor(client.uptime / 1000));
        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.messages.Uptime,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.botVariables(client),
                        uptime: uptime
                    }
                })
            ]
        });

    },
    description: "Get the bot uptime !",
    category: 'other',
    usage: "uptime",
    aliases: ['botuptime', 'bot-uptime'],
    options: [],
    cooldown: Utility.cooldown.uptime
}

function formatUptime (uptime) {
    let time = '';
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    if (days > 0) time += `${days} days, `
    if (hours > 0) time += ` ${hours} hours, `
    if (minutes > 0) time += ` ${minutes} minutes, `
    if (seconds > 0) time += ` ${seconds} seconds `
    return time;
} 