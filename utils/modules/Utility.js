const chalk = require('chalk');
const { Collection, ActivityType, ChannelType, AttachmentBuilder } = require('discord.js');
const invitesCache = new Collection();
const fs = require('fs');
const yaml = require('js-yaml');
const Database = require('../database/database');
const embed = require('./embed');
const client = require('../../index.js');
const figlet = require('figlet')
const { createCanvas, loadImage } = require('canvas');
const path = require('path')
const addonConfig = require('./addonConfig.js')
let Utility = {
    client: {
        commands: new Collection(),
        events: new Collection(),
        ApplicationCommands: []
    },
    messages: yaml.load(fs.readFileSync('./config/messages.yml')),
    embeds: yaml.load(fs.readFileSync('./config/embeds.yml')),
    config: yaml.load(fs.readFileSync('./config/config.yml')),
    permission: yaml.load(fs.readFileSync('./config/permissions.yml')),
    rewards: yaml.load(fs.readFileSync('./config/rewards.yml')),
    AddonConfig: addonConfig,
    database: new Database(),
    chalk: chalk,
    variables: require('./variables.js'),
    setupMessage: async function () {
        const text = await figlet.text('  Erno Bot    ', {
            font: '3D-ASCII',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        })
        console.log(chalk.hex('#4995ec').bold('-----------------------------------------------------------------------------------------------'))
        console.log(chalk.hex('#4995ec').bold('                                 Thanks for choosing:                             '))
        console.log(chalk.hex('#4995ec').bold(text))
        console.log(chalk.hex('#4995ec5').bold('                           https://discord.gg/SnSGxR6XjW                      '))
        console.log(chalk.hex('#4995ec').bold('-----------------------------------------------------------------------------------------------'))
    },
    embed: embed,
    updateInvites: async function updateInvites(guild) {
        try {
            const invites = await guild.invites.fetch();
            invitesCache.set(guild.id, invites);
            return {
                invites: invitesCache.size
            }
        } catch (error) {
            console.error(`Failed to update invites for guild ${guild.id}:`, error);
        }
    },

    getValidInvites: async function getValidInvites(guild) {
        const invites = await guild.invites.fetch();
        return invites.map(i => ({
            code: i.code,
            channel: i.channel.id,
            uses: i.uses ? i.uses : 0,
            inviter: i.inviter ? i.inviter.id : 'Unknown'
        }));
    },

    getUsedInvite: async function getInviteData(member, client) {
        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invitesCache.get(member.guild.id);

        if (!oldInvites || oldInvites.size === 0) {
            console.log('Old invite data not found.');
            return null;
        }

        const usedInvite = newInvites.find(inv => {
            const oldInvite = oldInvites.find(old => old.code === inv.code);
            return oldInvite;
        });

        if (usedInvite) {
            const inviter = await client.users.fetch(usedInvite.inviter.id);
            return {
                Inviter: inviter ? inviter.id : 'Unknown',
                InviteUses: usedInvite.uses,
                InviteCode: usedInvite.code,
            };
        } else {
            console.log('No new invites found.');
            return null;
        }
    },
    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
    botstatus: updateStatus,
    getUser: async function (messageOrInteraction, type, user) {
        if (type === 'message') {
            const foundUser = await messageOrInteraction.mentions.users.first() || messageOrInteraction.guild.members.cache.find((u) => u.user.id === user)?.user || messageOrInteraction.guild.members.cache.find((u) => u.user.username === user)?.user;
            if (foundUser) {
                return foundUser
            }
        } else if (type === 'interaction') {
            return messageOrInteraction.options.getUser('user');
        }
    },
    status: status,
    prepareTable: prepareTable,
    checkPerms: hasPerms,
    logger: {
        startup: console.log(chalk.hex("#56d970").bold("[ Erno ] Bot is starting up...")),
        ready: console.log(chalk.hex("#00b0ff").bold("[ Ready ] Bot is ready!"))
    },
    logMessage(type, text) {
        switch (type) {
            case 'success':
                console.log(chalk.hex("#00ff60").bold(text))
                break;
            case 'info':
                console.log(chalk.hex("#56d970").bold(text))
                break;
            case 'debug':
                console.log(chalk.hex("#bc83c6").bold(text))
                break;
            case 'error':
                console.log(chalk.hex("#f44336").bold(text))
                break;
            case 'warn':
                console.log(chalk.hex("#fff600").bold(text))
                break;
            default:
                console.log(text);
        }
    },
    userVariables: function (user, prefix = 'user') {
        if (!user) {
            return {};
        }

        const avatarURL = user.user.displayAvatarURL ? user.user.displayAvatarURL({ dynamic: true, size: 1024 }) : '';
        const createdTimestamp = user.user.createdTimestamp ? Math.floor(user.user.createdTimestamp / 1000) : 0;

        return {
            [`${prefix}-id`]: user.user.id,
            [`${prefix}-displayname`]: user.user.username,
            [`${prefix}-username`]: user.user.username,
            [`${prefix}-tag`]: user.user.tag,
            [`${prefix}-mention`]: `<@${user.user.id}>`,
            [`${prefix}-pfp`]: avatarURL,
            [`${prefix}-createdate`]: `<t:${createdTimestamp}:D>`,
            [`${prefix}-for`]: `<t:${createdTimestamp}:R>`,
        };
    },
    channelVariables: function (channel, prefix = 'channel') {
        if (!channel) {
            return {};
        }

        return {
            [`${prefix}-id`]: channel.id,
            [`${prefix}-name`]: channel.name,
            [`${prefix}-mention`]: `<#${channel.id}>`,
            [`${prefix}-type`]: channel.type,
            [`${prefix}-createdate`]: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
        };
    },
    serverVariables: function (guild, prefix = 'guild') {
        if (!guild) {
            return {};
        }

        return {
            [`${prefix}-id`]: guild.id,
            [`${prefix}-name`]: guild.name,
            [`${prefix}-membercount`]: guild.memberCount,
            [`${prefix}-ownerid`]: guild.ownerId,
            [`${prefix}-owner`]: `<@${guild.ownerId}>`,
            [`${prefix}-createdate`]: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            [`${prefix}-icon`]: guild.iconURL({ size: 1024 }),
            [`${prefix}-region`]: guild.region,
            [`${prefix}-afkchannelid`]: guild.afkChannelId ? `<#${guild.afkChannelId}>` : 'None',
            [`${prefix}-afktimeout`]: guild.afkTimeout / 60,
            [`${prefix}-verificationlevel`]: guild.verificationLevel,
            [`${prefix}-channelcount`]: guild.channels.cache.size,
            [`${prefix}-textchannelcount`]: guild.channels.cache.filter((c) => c.type === ChannelType.TEXT).size,
            [`${prefix}-voicechannelcount`]: guild.channels.cache.filter((c) => c.type === ChannelType.VOICE).size,
            [`${prefix}-categorychannelcount`]: guild.channels.cache.filter((c) => c.type === ChannelType.CATEGORY).size,
            [`${prefix}-rolecount`]: guild.roles.cache.size
        };
    },

    roleVariables: function (role, prefix = 'role') {
        if (!role) {
            return {};
        }

        return {
            [`${prefix}-id`]: role.id,
            [`${prefix}-name`]: role.name,
            [`${prefix}-mention`]: `<@&${role.id}>`,
            [`${prefix}-color`]: role.hexColor,
            [`${prefix}-createdate`]: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`,
        };
    },

    botVariables: function (bot, prefix = 'bot') {
        if (!bot) {
            return {};
        }

        return {
            [`${prefix}-id`]: bot.user.id,
            [`${prefix}-username`]: bot.user.username,
            [`${prefix}-mention`]: `<@${bot.user.id}>`,
            [`${prefix}-pfp`]: bot.user.displayAvatarURL({ dynamic: true }),
            [`${prefix}-createdate`]: `<t:${Math.floor(bot.user.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(bot.user.createdTimestamp / 1000)}:R>`,
            [`${prefix}-guildcount`]: bot.guilds.cache.size,
            [`${prefix}-channelcount`]: bot.channels.cache.size,
            [`${prefix}-membercount`]: bot.users.cache.size,
        };
    },

    reload: {
        commands: async function () {
            try {
                Utility.client.commands.clear();

                const commandsDir = './src/commands';
                const commandFolders = fs.readdirSync(commandsDir);
                Utility.logMessage('info', '[ Erno ] Reloading commands ...');
                for (const folder of commandFolders) {
                    const commandFiles = fs.readdirSync(`${commandsDir}/${folder}`).filter((file) => file.endsWith('.js'));
                    for (const file of commandFiles) {
                        const commandPath = `../../src/commands/${folder}/${file}`;
                        delete require.cache[require.resolve(commandPath)]; // Uklanjanje keširanog modula
                        const command = require(commandPath);

                        if (command.name) {
                            Utility.client.commands.set(command.name, command);
                        } else {
                            Utility.logMessage('error', `[ Erno ] Error: Command file '${file}' is missing a valid 'name' property.`);
                        }
                    }
                }
                const addonFiles = fs.readdirSync('./addons');
                for (const file of addonFiles) {
                    const addonPath = `../../addons/${file}`;
                    delete require.cache[require.resolve(addonPath)];
                    const addon = require(addonPath);

                    if (addon.commands && Array.isArray(addon.commands)) {
                        addon.commands.forEach(cmd => {
                            if (cmd.name) {
                                Utility.client.commands.set(cmd.name, cmd);
                            } else {
                                Utility.logMessage('error', `[ Erno ] Error: Addon file '${file}' contains a command without a valid 'name' property.`);
                            }
                        });
                    }
                }

                Utility.logMessage('info', '[ Erno ] All commands reloaded successfully.');
            } catch (error) {
                Utility.logMessage('error', `[ Erno ] Error reloading commands: ${error.message}`);
            }
        },
        addons: async function () {
            const addonFiles = fs.readdirSync('./addons');

            for (const file of addonFiles) {
                const addonPath = `../../addons/${file}`;
                delete require.cache[require.resolve(addonPath)];
                const addon = require(addonPath);

                if (addon.commands && Array.isArray(addon.commands)) {
                    addon.commands.forEach(cmd => {
                        if (cmd.name) {
                            if (Utility.client.commands.has(cmd.name)) {
                                Utility.client.commands.delete(cmd.name);
                            }
                            Utility.client.commands.set(cmd.name, cmd);
                        } else {
                            Utility.logMessage('error', `[ Erno ] Error: Addon file '${file}' contains a command without a valid 'name' property.`);
                        }
                    });
                }
            }
        },
        config: async function () {
            Utility.logMessage('info', "[ Erno ] Reloading configs ...")
            Utility.config = yaml.load(fs.readFileSync('./config/config.yml'));
            Utility.logMessage('info', '[ Erno ] [ Reloaded ] Reloaded configuration.');
        },
        permissions: async function () {
            Utility.logMessage('info', "[ Erno ] Reloading permissions ...")
            Utility.permission = yaml.load(fs.readFileSync('./config/permissions.yml'));
            Utility.logMessage('info', '[ Erno ] [ Reloaded ] Reloaded permissions.');
        },
        messages: async function () {
            Utility.logMessage('info', "[ Erno ] Reloading messages ...")
            Utility.messages = yaml.load(fs.readFileSync('./config/messages.yml'));
            Utility.logMessage('info', '[ Erno ] [ Reloaded ] Reloaded messages.');
        },
        rewards: async function () {
            Utility.logMessage('info', "[ Erno ] Reloading rewards ...")
            Utility.rewards = yaml.load(fs.readFileSync('./config/rewards.yml'));
            Utility.logMessage('info', '[ Erno ] [ Reloaded ] Reloaded rewards.');
        },

        modules: async function () {
            Utility.logMessage('info', "[ Erno ] Reloading modules ...")
            const moduleDir = fs.readdirSync('./utils/modules');
            for (const file of moduleDir) {
                delete require.cache[require.resolve(`../../utils/modules/${file}`)]
                require(`../../utils/modules/${file}`);
            }
            Utility.logMessage('info', '[ Erno ] [ Reloaded ] Reloaded modules.');
        }
    },
    sort: function (data, type, sortby, limit) {
        if (!Array.isArray(data)) {
            return [];
        }
        if (limit && typeof limit === 'number' && limit > 0) {
            data = data.slice(0, limit);
        }
        data.sort((a, b) => {
            if (typeof a[sortby] === 'number' && typeof b[sortby] === 'number') {
                return type === 'asc' ? a[sortby] - b[sortby] : b[sortby] - a[sortby];
            } else if (typeof a[sortby] === 'string' && typeof b[sortby] === 'string') {
                return type === 'asc' ? a[sortby].localeCompare(b[sortby]) : b[sortby].localeCompare(a[sortby]);
            }
            return 0;
        });

        return data;
    },
    prefix: async function (guild) {
        const hasPrefix = await Utility.database.findOne('prefix', { id: guild.id });
        return hasPrefix ? hasPrefix.prefix : Utility.config.prefix;
    },

    createWelcomeImage: async function createWelcomeCanvas(user, welcomeMessage) {
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
        const username = welcomeMessage;

        const backgroundImagePath = path.join(__dirname, '../../src/assets/welcome.png');
        const background = await loadImage(backgroundImagePath);

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarSize = 230;
        const avatarX = 129; // Pomereno za 10px ulevo
        const avatarY = (canvas.height - avatarSize) / 2;

        const avatar = await loadImage(avatarURL);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        let fontSize = 40;
        ctx.font = `bold ${fontSize}px Arial`;

        const textX = 385;
        const textY = canvas.height / 2;
        const textMaxWidth = 550;

        while (ctx.measureText(username).width > textMaxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        const words = username.split(' ');
        let line = '';
        const lines = [];

        for (const word of words) {
            const testLine = line + word + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > textMaxWidth) {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        lines.forEach((lineText, index) => {
            ctx.fillText(lineText, textX, textY + (index * fontSize * 1.2));
        });

        return new AttachmentBuilder(canvas.toBuffer(), { name: `${user.username}_welcome-image.png` });
    },
    createLeaveCard: async function createWelcomeCanvas(user, leaveMessage) {
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
        const username = leaveMessage;

        const backgroundImagePath = path.join(__dirname, '../../src/assets/leave.png');
        const background = await loadImage(backgroundImagePath);

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarSize = 230;
        const avatarX = 129; // Pomereno za 10px ulevo
        const avatarY = (canvas.height - avatarSize) / 2;

        const avatar = await loadImage(avatarURL);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        let fontSize = 40;
        ctx.font = `bold ${fontSize}px Arial`;

        const textX = 385;
        const textY = canvas.height / 2;
        const textMaxWidth = 550;

        while (ctx.measureText(username).width > textMaxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        const words = username.split(' ');
        let line = '';
        const lines = [];

        for (const word of words) {
            const testLine = line + word + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > textMaxWidth) {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        lines.forEach((lineText, index) => {
            ctx.fillText(lineText, textX, textY + (index * fontSize * 1.2));
        });

        return new AttachmentBuilder(canvas.toBuffer(), { name: `${user.username}_leave-image.png` });
    },

    createLevelCard: async function createWelcomeCanvas(username, avatarURL, levelMessage, progressString) {
        const backgroundImagePath = path.join(__dirname, '../../src/assets/level.png');
        const background = await loadImage(backgroundImagePath);

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const positions = {
            avatar: {
                x: 129,
                y: (canvas.height - 230) / 2,
                size: 230
            },
            username: {
                x: 405,
                y: 90,
                maxWidth: 550
            },
            levelMessage: {
                x: 400,
                y: 170
            },
            progress: {
                x: 401,
                y: 333
            }
        };

        const avatar = await loadImage(avatarURL);
        ctx.save();
        ctx.beginPath();
        ctx.arc(positions.avatar.x + positions.avatar.size / 2, positions.avatar.y + positions.avatar.size / 2, positions.avatar.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, positions.avatar.x, positions.avatar.y, positions.avatar.size, positions.avatar.size);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        let fontSize = 40;
        ctx.font = `bold ${fontSize}px Arial`;

        while (ctx.measureText(username).width > positions.username.maxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        ctx.fillText(username, positions.username.x, positions.username.y);

        fontSize = 30;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(levelMessage, positions.levelMessage.x, positions.levelMessage.y);

        fontSize = 19;
        ctx.font = `${fontSize}px Arial`
        ctx.fillText(progressString, positions.progress.x, positions.progress.y);

        return new AttachmentBuilder(canvas.toBuffer(), { name: `${username}_level-image.png` });
    },

    findChannel: function foundChannel(guild, channel) {
        if (!guild || typeof guild !== 'object') {
            console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
            return;
        }

        if (!channel || typeof (channel) !== 'string') {
            console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81').bold(` Invalid channel provided.`));
            return;
        }

        const foundChannel = guild.channels.cache.find((c) => c.name === channel) || guild.channels.cache.get(channel);
        if (foundChannel) {
            return foundChannel;
        } else {
            console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81').bold(` Channel not found, missing channel: ${channel}`));
            return;
        }
    },
    updatePunishments: async function (user, data) {
        const hasPunishment = await new Database().findOne('punishements', { id: user.id });
        if (!hasPunishment) {
            await new Database().insert('punishements', { id: user.id, punishments: JSON.stringify([data]) });
        } else {
            const allPunishments = JSON.parse(hasPunishment.punishments || []);
            allPunishments.push(data);
            await new Database().update('punishements', { punishments: JSON.stringify(allPunishments) }, { id: user.id });
        }
    },
    createMissingFolders: function () {
        const folders = ['./utils/transcripts', './addons', './config/addons_config'];
        folders.forEach((folder) => {
            if (!fs.existsSync(folder)) {
                try {
                    fs.mkdirSync(folder);
                } catch (err) {
                    Utility.logMessage('error', `[ Creating Folder Error ] ${err}`)
                }
            }
        });
    },
    setupBot: async function (guild) {
        try {
            const permissions = await Utility.permission;
            const existingRoles = guild.roles.cache;

            const rolesToCreate = new Set();

            Object.values(permissions).forEach(roleList => {
                if (Array.isArray(roleList)) {
                    roleList.forEach(role => {
                        if (role !== 'everyone' && role !== '@everyone') {
                            rolesToCreate.add(role);
                        }
                    });
                }
            });

            rolesToCreate.forEach(async roleName => {
                const existingRole = existingRoles.find(r => r.name === roleName) || existingRoles.find(r => r.id === roleName);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleName,
                        reason: `Auto-created role for permissions: ${roleName}`
                    })
                }
            });
        } catch (error) {
            console.error('Error setting up roles:', error);
        }
    },
    replaceVariables: function (text, variables) {
        if (!text || !variables || typeof text !== 'string') {
            return text;
        }

        for (const [key, value] of Object.entries(variables)) {
            text = text.replace(new RegExp(`{${key}}`, 'g'), value);
        }

        return text;
    },
    fetchChannel: function fetchChannel(moi, type, args) {
        let channel;

        if (type === 'interaction') {
            channel = moi.options.getChannel('channel');
        } else if (type === 'message') {
            channel = moi.mentions?.channels.first() || Utility.findChannel(moi.guild, args);
        } else {
            channel = moi.channel;
        }

        return channel;
    },
    waitForReact: async function(message, user, emojis, time) {
        if(!time) time == '1m'
        return new Promise((resolve) => {
            const collector = message.createReactionCollector({
                filter: (reaction, reactingUser) => {
                    return emojis.includes(reaction.emoji.name) && !reactingUser.bot;
                },
                time: ms(time) 
            });

            collector.on('collect', (reaction, reactingUser) => {
                if (reactingUser.id === user.id) {
                    reaction.users.remove(user.id);
                    resolve({user: user, emoji: reaction.emoji.name});
                }
            });

            collector.on('end', () => {
                resolve(null);
            });
        });
    },
    waitForResponse: function (userid, channel) {
        return new Promise((resolve, reject) => {
            channel.awaitMessages({ filter: m => m.author.id == userid, max: 1 })
                .then(msgs => {
                    resolve(msgs.first());
                })
                .catch(reject);
        });
    }
}

module.exports = Utility;


function prepareTable() {
    new Database().createTable('prefix', {
        id: 'TEXT PRIMARY KEY',
        prefix: 'TEXT'
    });

    new Database().createTable('lockdown', {
        id: 'TEXT PRIMARY KEY',
        enabled: 'BOOLEAN',
        locked_channels: "JSON"
    });

    new Database().createTable('level', {
        id: 'TEXT PRIMARY KEY',
        level: 'INTEGER',
        exp: 'INTEGER',
        next_level_exp: 'INTEGER'
    })

    new Database().createTable('coins', {
        id: 'TEXT PRIMARY KEY',
        balance: 'INTEGER',
        bank: "INTERGER"
    });

    new Database().createTable('idbans', {
        id: 'TEXT PRIMARY KEY',
        reason: 'TEXT',
    });

    new Database().createTable('botstatus', {
        id: 'TEXT PRIMARY KEY',
        text: 'TEXT',
        type: 'TEXT',
        status: 'TEXT'
    });

    new Database().createTable('punishements', {
        id: 'TEXT PRIMARY KEY',
        punishements: "JSON"
    });

    new Database().createTable('invites', {
        id: 'TEXT PRIMARY KEY',
        invites: "JSON"
    })

    Utility.logMessage('info', '[ Erno ] Database tables created successfully.')
}


async function updateStatus(client, status) {
    let tt;

    // Default activity type based on input
    switch (status.type?.toLowerCase()) {
        case "playing":
            tt = ActivityType.Playing;
            break;
        case "watching":
            tt = ActivityType.Watching;
            break;
        case "listening":
            tt = ActivityType.Listening;
            break;
        case "competing":
            tt = ActivityType.Competing;
            break;
        default:
            tt = ActivityType.Watching;
            break;
    }

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.log(chalk.hex('#ef8b81').bold('[ Status Error ] Could not find any guild, bot is shutting down.'));
        process.exit();
        return;
    }

    const hasDbStatus = await Utility.database.findOne('botstatus', { id: client.user.id });

    if (hasDbStatus) {
        // Use status from the database
        switch (hasDbStatus.type?.toLowerCase()) {
            case "playing":
                tt = ActivityType.Playing;
                break;
            case "watching":
                tt = ActivityType.Watching;
                break;
            case "listening":
                tt = ActivityType.Listening;
                break;
            case "competing":
                tt = ActivityType.Competing;
                break;
            default:
                tt = ActivityType.Watching;
                break;
        }

        client.user.setPresence({
            activities: [{
                name: hasDbStatus.text
                    .replace(/{members}/g, guild.members.cache.filter((m) => !m.user.bot).size)
                    .replace(/{bots}/g, guild.members.cache.filter((m) => m.user.bot).size)
                    .replace(/{total}/g, guild.members.cache.size)
                    .replace(/{tickets}/g, guild.channels.cache.filter((c) => c.name.startsWith("ticket-")).size)
                    .replace(/{onlineUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "online").size)
                    .replace(/{offlineUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "offline").size)
                    .replace(/{dndUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "dnd").size)
                    .replace(/{idleUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "idle").size)
                    .replace(/{textChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size)
                    .replace(/{voiceChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size)
                    .replace(/{categoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size),
                type: tt
            }],
            status: hasDbStatus.status || 'online'
        });
        return;
    }
    client.user.setPresence({
        activities: [{
            name: status.name
                .replace(/{members}/g, guild.members.cache.filter((m) => !m.user.bot).size)
                .replace(/{bots}/g, guild.members.cache.filter((m) => m.user.bot).size)
                .replace(/{total}/g, guild.members.cache.size)
                .replace(/{tickets}/g, guild.channels.cache.filter((c) => c.name.startsWith("ticket-")).size)
                .replace(/{onlineUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "online").size)
                .replace(/{offlineUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "offline").size)
                .replace(/{dndUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "dnd").size)
                .replace(/{idleUsers}/g, guild.members.cache.filter((m) => m.presence?.status === "idle").size)
                .replace(/{textChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size)
                .replace(/{voiceChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size)
                .replace(/{categoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size),
            type: tt
        }],
        status: status.status || 'online'
    });
};


async function status(client, statuses) {
    let index = 0;

    setTimeout(async () => {
        await updateStatus(client, statuses[index]);
    }, 3000);

    setInterval(async () => {
        index = (index + 1) % statuses.length;
        await updateStatus(client, statuses[index]);
    }, 30000);
}


function hasPerms(member, guild, perms) {
    let canExecute = false;

    if (!member || typeof member !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81').bold(' Invalid member provided.'));
        return;
    }

    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!perms || !Array.isArray(perms)) {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81').bold(`Invalid permission: ${perms}`) + chalk.hex('#ef8b81').bold('Permission must be an array.'));
        return;
    }

    if (perms.includes(member.user.username) || perms.includes(member.user.id)) {
        canExecute = true;
    }

    if (perms.includes("@everyone") || perms.includes("everyone")) {
        canExecute = true;
    }

    for (const role of perms) {
        const foundRole = guild.roles.cache.find((r) => r.name === role) || guild.roles.cache.get(role);
        if (foundRole && member.roles.cache.has(foundRole.id)) {
            canExecute = true;
            break;
        }
    }

    return canExecute;
}

