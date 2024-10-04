const { ChannelType, PermissionFlagsBits } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'lockdown',
    async execute(moi, args, client, { type, reply }) {
        const isActive = type === 'message' ? args[0] : moi.options.getString('active');

        if (!isActive) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                        }
                    })
                ]
            });
        }

        const channels = moi.guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement);
        const lockdownDatabase = await Utility.database.findOne('lockdown', { id: moi.guild.id });
        const lockedChannels = lockdownDatabase ? JSON.parse(lockdownDatabase.locked_channels || '[]') : [];

        channels.forEach(channel => {
            const permissions = channel.permissionsFor(moi.guild.id);

            if (isActive === 'on') {
                if (!permissions.has(PermissionFlagsBits.SendMessages)) {
                    return;
                }
                channel.permissionOverwrites.edit(moi.guild.id, {
                    SendMessages: false
                });
                if (!lockedChannels.includes(channel.id)) {
                    lockedChannels.push(channel.id);
                }

            } else if (isActive === 'off') {
                if (permissions.has(PermissionFlagsBits.SendMessages)) {
                    return;
                }
                channel.permissionOverwrites.edit(moi.guild.id, {
                    SendMessages: true
                });
                const index = lockedChannels.indexOf(channel.id);
                if (index !== -1) {
                    lockedChannels.splice(index, 1);
                }
            }
        });

        if (lockdownDatabase) {
            await Utility.database.update('lockdown', { 
                enabled: isActive === 'on', 
                locked_channels: JSON.stringify(lockedChannels) 
            }, { id: moi.guild.id });
        } else {
            await Utility.database.insert('lockdown', {
                id: moi.guild.id,
                enabled: isActive === 'on',
                locked_channels: JSON.stringify(lockedChannels)
            });
        }

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: 'Lockdown Module',
                    description: `Lockdown module has been ${isActive === 'on'? 'enabled' : 'disabled'}!`,
                    color: `${isActive == 'on' ? 'error': 'default'}`,
                    timestamp: true
                })
            ]
        })
    },
    description: "Lock entire server!",
    aliases: ['lockserver'],
    category: 'admin',
    usage: 'lockdown on/off',
    options: [
        {
            name: 'active',
            description: "Activate or Deactivate lockdown module!",
            type: 3, // String type
            required: true,
            choices: [
                {
                    name: 'on',
                    value: 'on' // String for activation
                },
                {
                    name: 'off',
                    value: 'off' // String for deactivation
                }
            ]
        }
    ],
};