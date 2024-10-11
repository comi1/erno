let Utility = require("../../../utils/modules/Utility.js");
const path = require('path');

module.exports = {
    name: 'reload',
    aliases: [],
    async execute(moi, args, client, { type, reply }) {

        const reloadMethod = type === 'message' ? args[0] : moi.options.getString('type') || 'all'
        if (!reloadMethod) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "Invalid Type!",
                        description: "`Please provide a valid type to reload. (config, permissions, messages, commands, addons, rewards, modules, all)`",
                        color: 'error',
                        timestamp: true
                    })
                ]
            });
        }

        let reloadType;
        if (!['config', 'permissions', 'messages', 'commands', 'addons', 'rewards', 'modules', 'all'].includes(reloadMethod.toLowerCase())) {
            reloadType = 'all';
        } else {
            reloadType = reloadMethod.toLowerCase();
        } 

        if (reloadType === 'all') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "All Modules Reloaded",
                        description: "> Bot have been reloaded successfully!",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.config();
            await Utility.reload.permissions();
            await Utility.reload.messages();
            await Utility.reload.commands();
            await Utility.reload.rewards();
            await Utility.reload.modules();
        }

        if (reloadType === 'config') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "⚙️ | Config Reloaded",
                        description: "> Bot config has been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.config();
        }

        if (reloadType === 'permissions') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "🔧 | Permissions Reloaded",
                        description: "> Bot permissions have been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.permissions();
        }

        if (reloadType === 'messages') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "💬 | Messages Reloaded",
                        description: "> Bot messages have been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.messages();
        }

        if (reloadType === 'commands') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "👨‍💻 | Commands Reloaded",
                        description: "> Bot commands have been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.commands();
        }

        if (reloadType === 'addons') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "🧩 | Addons Reloaded",
                        description: "> Bot addons have been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.addons();
        }

        if (reloadType === 'rewards') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "📦 | Rewards Reloaded",
                        description: "> Bot rewards have been reloaded successfully !",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.rewards();
        }

        if (reloadType === 'modules') {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "🧰 | Modules Reloaded",
                        description: "> Bot modules have been reloaded successfully!",
                        color: 'success',
                        timestamp: true
                    })
                ]
            });
            await Utility.reload.modules();
        }
    },
    description: 'Reload the bot',
    category: 'management',
    options: [
        {
            name: 'type',
            description: 'The type of reloading to perform',
            type: 3,
            required: true,
            choices: [
                { name: 'Config', value: 'config' },
                { name: 'Permissions', value: 'permissions' },
                { name: 'Messages', value: 'messages' },
                { name: 'Commands', value: 'commands' },
                { name: 'Addons', value: 'addons' },
                { name: 'Rewards', value: 'rewards' },
                { name: 'Modules', value: 'modules' },
                { name: 'All', value: 'all' }
            ]
        }
    ],
    cooldown: Utility.cooldown.reload
};
