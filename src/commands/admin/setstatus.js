const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'setstatus',
    async execute(moi, args, client, { type, reply }) {

        const text = type == 'message' ? args.slice(2).join(" ") : moi.options.getString('text');
        const status = type == 'message' ? args[0] : moi.options.getString('status');
        const activityType = type == 'message' ? args[1] : moi.options.getString('type');

        if (!text || !status || !activityType) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                        }
                    })
                ]
            })
        }

        Utility.botstatus(client, {
            type: activityType,
            name: text,
            status: status
        })

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: '🧑‍💻 | Status Updated',
                    description: `The bot's status has been set to \`${text}\` with the activity type \`${activityType}\`.`,
                    color: 'default',
                    timestamp: true
                })
            ]
        })

        const currentStatus = await Utility.database.findOne('botstatus', { id: client.user.id });
        if (!currentStatus) {
            await Utility.database.insert('botstatus', { id: client.user.id, text: text, type: activityType, status: status });
        } else {
            await Utility.database.update('botstatus', { text: text, type: activityType, status: status }, { id: client.user.id });
        }

    },
    description: 'Sets the status of the bot.',
    options: [
        {
            name:'text',
            description: 'The new status for the bot.',
            type: 3,
            required: true,
        },
        {
            name: 'status',
            description: 'The type of status (online, idle, dnd, offline).',
            type: 3,
            required: true,
            choices: [
                { name: 'online', value: 'online' },
                { name: 'idle', value: 'idle' },
                { name: 'dnd', value: 'dnd' },
                { name: 'offline', value: 'offline' },
            ],
        },
        {
            name: 'type',
            description: 'The type of status (playing, watching, competiting...).',
            type: 3,
            required: true,
            choices: [
                { name: 'playing', value: 'playing'},
                { name: 'watching', value: 'watching' },
                { name: 'competing', value: 'competing' },
                { name: 'listening', value: 'listening' },
            ],
        }
    ],
    usage: 'setstatus <status> <activity type> <status> || setstatus online testing watching',
    aliases: ['sstatus'],
    category: 'admin'
}