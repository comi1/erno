const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    name: 'help',
    async execute(moi, args, client, { type, reply }) {
        let displayType;
        if (Utility.config.Help.Type === 'categories') displayType = 'categories';
        if (Utility.config.Help.Type === 'list') displayType = 'list';

        const emojiObject = {
            admin: '🧰',
            management: '🛠️',
            moderation: '📜',
            utils: '🔍',
            addon: '🧩',
            exp: '🧪',
            other: '🌏',
            economy: "💰",
            tickets: "🎫"
          }          

        if (!Utility.client || !Utility.client.commands) {
            return reply(type, moi, {
                embeds: [Utility.embed({
                    title: 'Error',
                    description: 'Commands are not properly loaded.',
                    color: 0xFF0000,
                    timestamp: true,
                })]
            });
        }

        const categories = [];

        Utility.client.commands.forEach(cmd => {
            if (cmd.category && !categories.includes(cmd.category)) {
                categories.push(cmd.category);
            }
        });

        const prefix = await Utility.prefix(moi.guild)

        if (displayType === 'list') {
            let helpMessage = '';
        
            if (categories.length === 0) {
                return reply(type, moi, {
                    embeds: [Utility.embed({
                        title: 'Help',
                        description: 'No commands found.',
                        timestamp: true,
                    })]
                }, true);
            }
        
            categories.forEach(category => {
                helpMessage += `${emojiObject[category]} | **${Utility.capitalizeFirstLetter(category)} Commands:**\n`;
                Utility.client.commands
                    .filter(cmd => cmd.category === category)
                    .forEach(cmd => {
                        helpMessage += `- **${prefix}${cmd.name}** - ${cmd.description}\n`;
                    });
                
                helpMessage += '\n\n';
            });
        
            return reply(type, moi, {
                embeds: [Utility.embed({
                    ...Utility.messages.Help,
                    description: helpMessage,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member)
                    }
                })]
            }, true);
        }
        

if (displayType === 'categories') {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('help_category_menu')
        .setPlaceholder('Select a category')
        .addOptions(categories.map(category => ({
            label: `${emojiObject[category]} | ${Utility.capitalizeFirstLetter(category)}`,
            value: category,
        })));

    const row = new ActionRowBuilder().addComponents(menu);

    const helpMessage = await reply(type, moi, {
        embeds: [Utility.embed({
            ...Utility.messages.Help,
            description: 'Select a category to see commands!',
            variables: {
                ...Utility.serverVariables(moi.guild),
                ...Utility.userVariables(moi.member)
             }
        })],
        components: [row],
    }, true);

    const filter = interaction => interaction.user.id === moi.member.user.id && interaction.customId === 'help_category_menu';

    const collector = helpMessage.createMessageComponentCollector({ 
        filter, 
        componentType: ComponentType.StringSelect,
        time: 60000 
    });

    collector.on('collect', async interaction => {
        const selectedCategory = interaction.values[0];
        let commandsInCategory = ''
        commandsInCategory += `${emojiObject[selectedCategory]} | **${Utility.capitalizeFirstLetter(selectedCategory)} Commands:**\n`
        commandsInCategory += Utility.client.commands
            .filter(cmd => cmd.category === selectedCategory)
            .map(cmd => `- **${prefix}${cmd.name}**: ${cmd.description}`)
            .join('\n');

        await interaction.update({
            embeds: [Utility.embed({
                ...Utility.messages.Help,
                description: commandsInCategory || 'No commands found in this category.',
                variables: {
                   ...Utility.serverVariables(moi.guild),
                   ...Utility.userVariables(moi.member)
                }
            })],
            components: [row],
        });
    });

    collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
            menu.setDisabled(true)
        );
    
        await helpMessage.edit({
            components: [disabledRow]
        });
    });    
}

    },
    description: 'Display bot commands',
    usage: 'help || help [command]',
    category: 'utils',
    aliases: [],
}
