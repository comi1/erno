const yaml = require('js-yaml');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js')
module.exports = (config) => {
    const fileContents = fs.readFileSync('./config/config.yml', 'utf8');
    const embedColors = yaml.load(fileContents);

    let embed = new EmbedBuilder()
    if (config.color) {
        const color = config.color.toLowerCase();
        if (color === 'success') embed.setColor(embedColors.EmbedColors.Success);
        else if (color === 'error') embed.setColor(embedColors.EmbedColors.Error);
        else if (color === 'default') embed.setColor(embedColors.EmbedColors.Default);
        else embed.setColor(parseInt(color.replace(/#/g, ''), 16) || '#0390fc');
    }

    if (config.title) embed.setTitle(replaceVariables(config.title.slice(0, 1024), config.variables));
    if (config.description) embed.setDescription(replaceVariables(config.description.slice(0, 2048), config.variables));

    if(config.footer && typeof(config.footer) == 'string') {
        embed.setFooter({ text: replaceVariables(config.footer.toString(), config.variables) })
    }

    if(config.author && typeof(config.author) == 'string') {
        embed.setAuthor({ name: replaceVariables(config.author.toString(), config.variables) })
    }

    if(config.image) {
        const url = replaceVariables(config.image, config.variables) || config.image;
        if(isValidUrl(url)) {
            embed.setImage(url);
        } else {
            embed.setImage(null)
        }
    }

    if(config.thumbnail) {
        const url = replaceVariables(config.thumbnail, config.variables) || config.thumbnail;
        if(isValidUrl(url)) {
            embed.setThumbnail(url);
        } else {
            embed.setThumbnail(null)
        }
    }

    if(config.authorIcon && config.author) {
        const url = replaceVariables(config.authorIcon, config.variables) || config.authorIcon;
        if(isValidUrl(url)) {
            embed.setAuthor({name: replaceVariables(config.author.toString(), config.variables), iconURL: url});
        }
    }

    if(config.footerIcon && config.footer) {
        const url = replaceVariables(config.footerIcon, config.variables) || config.footerIcon;
        if(isValidUrl(url)) {
            embed.setFooter({text: replaceVariables(config.footer.toString(), config.variables), iconURL: url});
        }
    }

    if(config.timestamp && config.timestamp === true) {
        embed.setTimestamp();
    }

    if(config.url) {
        const url = replaceVariables(config.url, config.variables) || config.url;
        if(isValidUrl(url)) {
            embed.setURL(url);
        } else {
            embed.setURL(null)
        }
    }

    if (config.fields) {
        config.fields.forEach(field => {
            embed.addFields({
                name: replaceVariables(field.name, config.variables),
                value: replaceVariables(field.value, config.variables),
                inline: field.inline ? true : false
            });
        });
    }

    return embed;
}

const replaceVariables = (text, variables) => {
    if (!text || !variables || typeof text !== 'string') {
        return text;
    }

    for (const [key, value] of Object.entries(variables)) {
        text = text.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return text;
}

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}