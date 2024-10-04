const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'help',
    aliases: [],
    async execute(moi, args, client, { type, reply }) {

        // Dobijanje prefixa za trenutni guild
        const prefix = await Utility.prefix(moi.guild);

        const commands = Utility.client.commands;
        const categories = {};

        commands.forEach(command => {
            if (!categories[command.category]) categories[command.category] = [];
            // Dodaj prefix ispred svake komande
            categories[command.category].push(`${prefix}${command.name} ❯ ${command.description}`);
        });
        
        const categoryNames = Object.keys(categories);
        let page = 0;

        const emojis = {
            'management': '🧑‍💻',
            'admin': '💢',
            'exp': '🎚️',
            'moderation': '🛠️',
            'utils': '🌐',
            'addon': "👜",
            'info': "✨",
            'fun': "😆",
            'economy': "💰",
            'dev': "🤓",
            'owner': "👑",
            'ticket': '🎫'
        };

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: `\`${emojis[categoryNames[page]] || '⏳'}\` Help Menu - ${categoryNames[page].charAt(0).toUpperCase() + categoryNames[page].slice(1).toLowerCase()}`,
                    description: `> ${categories[categoryNames[page]].join('\n> ') || "No commands available."}`,
                    color: "default",
                    timestamp: true
                })
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬅️')
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('➡️')
                        .setDisabled(categoryNames.length <= 1)
                )
            ]
        }, true).then(async msg => {

            const collector = msg.createMessageComponentCollector({
                time: 30000,
            });

            collector.on('collect', async interaction => {
                if (!interaction.isButton()) return;

                if (interaction.customId === 'prev') {
                    if (page > 0) {
                        page--;
                    }
                } else if (interaction.customId === 'next') {
                    if (page < categoryNames.length - 1) {
                        page++;
                    }
                }

                const currentCategory = categoryNames[page];
                const categoryCommands = categories[currentCategory].join('\n> ');

                await interaction.update({
                    embeds: [
                        Utility.embed({
                            title: `\`${emojis[currentCategory] || '⏳'}\` Help Menu - ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).toLowerCase()}`,
                            description: `> ${categoryCommands || "No commands available."}`,
                            color: "default",
                            timestamp: true
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('⬅️')
                                .setDisabled(page === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('➡️')
                                .setDisabled(page === categoryNames.length - 1)
                        )
                    ]
                });
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });
        });
    },
    description: 'Displays all available commands!',
    category: 'utils',
    options: []
};