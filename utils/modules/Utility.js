const chalk = require('chalk');
const { Collection, ActivityType, ChannelType, AttachmentBuilder } = require('discord.js');
const invitesCache = new Map();
const InvitesTracker = require('@androz2091/discord-invites-tracker');
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
    cooldown: yaml.load(fs.readFileSync('./config/cooldowns.yml')),
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
            invitesCache.clear();
            const invites = await guild.invites.fetch();
            invitesCache.set(guild.id, invites);
            return { invites: invites.size };
        } catch (error) {
            Utility.logMessage('error', `[ Invites Fetch Error ] Could not fetch invites for guild ${guild.id}`);
        }
    },
    getValidInvites: async function getValidInvites(guild) {
        try {
            const invites = await guild.invites.fetch();

            return invites.map(i => ({
                code: i.code,
                channel: i.channel ? i.channel.id : 'Unknown',
                uses: i.uses ? i.uses : 0,
                inviter: i.inviter ? i.inviter.id : 'Unknown'
            }));
        } catch (error) {
            console.error(`Error fetching valid invites for guild ${guild.id}:`, error);
            return [];
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

    createCaptcha: async function captchaCreate(length = 5) {
        if (length < 5) {
            throw new Error("Captcha cannot be less than 5 characters");
        }

        const width = 350;
        const height = 100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Postavljamo pozadinsku boju na Discord boju
        ctx.fillStyle = '#2f3031';
        ctx.fillRect(0, 0, width, height);

        // Postavljamo boju teksta na belu
        ctx.font = '15px Arial';
        ctx.fillStyle = '#ffffff';

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captchaText = '';
        for (let i = 0; i < length; i++) {
            const character = characters.charAt(Math.floor(Math.random() * characters.length));
            captchaText += character;
            ctx.fillText(character, 15 + i * 40, 65); // Povećan razmak zbog većeg fonta
        }

        // Dodajemo nasumične linije preko CAPTCHA koda
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = '#ffffff'; // Boja linija je bela
            ctx.lineWidth = 2; // Debljina linije
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height); // Nasumična početna tačka
            ctx.lineTo(Math.random() * width, Math.random() * height); // Nasumična krajnja tačka
            ctx.stroke();
        }

        return {
            buffer: canvas.toBuffer(),
            text: captchaText
        };
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
        const hasPunishment = await new Database().findOne('punishments', { id: user.id });

        if (!hasPunishment) {
            await new Database().insert('punishments', { id: user.id, punishments: JSON.stringify([data]) });
        } else {
            let allPunishments;
            try {
                allPunishments = JSON.parse(hasPunishment.punishments || '[]');
            } catch (error) {
                console.error(`Error parsing punishments for user ${user.id}:`, error);
                allPunishments = [];
            }


            allPunishments.push(data);
            await new Database().update('punishments', { punishments: JSON.stringify(allPunishments) }, { id: user.id });
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
    waitForReact: async function (message, user, emojis, time) {
        if (!time) time == '1m'
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
                    resolve({ user: user, emoji: reaction.emoji.name });
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
    },
    checkForAdvertisement: function (message) {
        const AdvertisementConfig = Utility.config.Antilink;
        if (!AdvertisementConfig.enabled) return false;
        if (message.author.bot) return;

        if (AdvertisementConfig.whitelist_channels.includes(message.channel.id) || AdvertisementConfig.whitelist_channels.includes(message.channel.name)) return false;
        if (AdvertisementConfig.whitelist_users.includes(message.author.id) || AdvertisementConfig.whitelist_users.includes(message.author.username)) return false;

        if (Utility.checkPerms(message.member, message.guild, AdvertisementConfig.whitelist_roles)) return false;

        const foundLink = message.content.match(/(?:https?:\/\/)?(?:www\.)?(discord\.gg|discordapp\.com\/invite|[a-zA-Z0-9\-]+\.[a-zA-Z]{2,})/g);

        if (foundLink) {
            const isWhitelisted = foundLink.some(link => {
                return AdvertisementConfig.whitelisted_domains.some(domain => link.includes(domain));
            });
            if (isWhitelisted) return false;
        }
        return foundLink ? true : false;
    },
    generateInviteLink: function (guild, permissions) {
        return guild.channels.cache.find(c => c.permissionsFor(guild.me).has(permissions))?.createInvite({
            maxAge: 0,
            maxUses: 0,
            temporary: false,
            reason: 'Automatically generated invite for the bot'
        }) || null;
    },
    getPunishments: async function (user) {
        const hasPunishment = await new Database().findOne('punishments', { id: user.id });
        if (!hasPunishment) return [];
        try {
            return JSON.parse(hasPunishment.punishments || '[]');
        } catch (error) {
            return [];
        }
    },
    modules: function modules() {
        ['Verification', 'JoinRoles'].forEach(module => {
            const isActive = Utility.config[module]?.enabled;
            if (isActive) {
                return Utility.logMessage('info', `[ Module ] [ ${module} ] is active`);
            } else {
                Utility.logMessage('info', `[ Module ] [ ${module} ] is disabled`);
            }

        })
    },
    createPath: function createPath(folder, file, config) {
        if (folder && !fs.existsSync(`./config/addons_config/${folder}`)) {
            fs.mkdirSync(`./config/addons_config/${folder}`);
        }
        const path = new Utility.AddonConfig(`./config/addons_config/${folder ? `${folder}/${file}` : `${file}`}`, config);
        return path;
    },
    formatUserTime: function parseMilliseconds(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        const parts = [];

        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

        return parts.length > 0 ? parts.join(', ') : '0 seconds';
    },

    ticketTranscript: async function transcript(channel) {
        const messages = await channel.messages.fetch({ limit: 100 });
        let transcript = `
        <html>
            <head>
                <style>
                    body {
                        background-color: #23272a; /* Tamna pozadina */
                        color: #ffffff; /* Svetla boja teksta */
                        font-family: Arial, sans-serif; /* Font */
                        margin: 0;
                        padding: 20px; /* Razmak oko sadržaja */
                    }
                    a {
                        color: #0097C8; /* Tamnija nijansa plave boje za linkove */
                        text-decoration: none; /* Bez donje crte */
                    }
                    a:hover {
                        text-decoration: underline; /* Donja crta kada je link na hover */
                    }
                    blockquote {
                        background: #2f3136; /* Pozadina za blockquote */
                        padding: 5px 10px; /* Razmak unutar blockquote-a */
                        border-left: 4px solid #0097C8; /* Levo poravnanje */
                        margin: 5px 0; /* Razmak između blockquote-a i drugih elemenata */
                    }
                </style>
            </head>
            <body>
    `;
    
        function parseFormatting(text) {
            return text
                .replace(/`([^`]+)`/g, '<code>$1</code>')                          // inline code
                .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')               // bold
                .replace(/\*([^\*]+)\*/g, '<em>$1</em>')                           // italic
                .replace(/__([^\_]+)__/g, '<u>$1</u>')                             // underline
                .replace(/~~([^~]+)~~/g, '<del>$1</del>')                          // strikethrough
                .replace(/> (.+)/g, '<blockquote>$1</blockquote>')                 // blockquote
                .replace(/\[(.+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>') // links
                .replace(/<@!?(\d+)>/g, '<span style="color: #00AFF4;">@$1</span>') // mentions
                .replace(/\n/g, '<br>');                                            // newlines
        }
    
        messages.reverse().forEach(message => {
            const author = message.author;
            const userColor = message.member ? message.member.displayHexColor : '#ffffff';
            const timestamp = message.createdAt.toLocaleString();
            const avatarUrl = author.displayAvatarURL();
    
            transcript += `
                <div style="display: flex; margin-bottom: 10px; align-items: flex-start;">
                    <img src="${avatarUrl}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                    <div>
                        <span style="color:${userColor}; font-weight: bold;">${author.username} (${author.id})</span>
                        <span style="color: #72767d; font-size: 12px;">[${timestamp}]</span>
                        <div style="background-color: transparent; border: none; padding: 0;">${parseFormatting(message.content)}</div>
                    </div>
                </div>
            `;
    
            if (message.embeds.length > 0) {
                message.embeds.forEach(embed => {
                    transcript += `
                        <div style="border-left: 4px solid ${embed.color ? `#${embed.color.toString(16)}` : '#00ff00'}; background-color: #2f3136; padding: 10px; margin: 10px 0; border-radius: 5px;">
                            ${embed.title ? `<strong style="font-size: 16px;">${parseFormatting(embed.title)}</strong><br>` : ''}
                            ${embed.description ? `<p>${parseFormatting(embed.description)}</p>` : ''}
                            ${embed.fields.map(field => `<strong>${parseFormatting(field.name)}</strong>: ${parseFormatting(field.value)}<br>`).join('')}
                            ${embed.image ? `<img src="${embed.image.url}" alt="Embed Image" style="max-width:400px;"><br>` : ''}
                        </div>
                    `;
                });
            }
    
            if (message.attachments.size > 0) {
                message.attachments.forEach(attachment => {
                    if (attachment.contentType.startsWith('image/')) {
                        transcript += `<img src="${attachment.url}" alt="User Image" style="max-width:400px;"><br>\n`;
                    } else {
                        transcript += `<a href="${attachment.url}">Download File</a><br>\n`;
                    }
                });
            }
    
            transcript += '<hr>\n';
        });
    
        transcript += `
                </body>
            </html>
        `;
    
        try {
            fs.writeFileSync(`./utils/transcripts/${channel.id}-transcript.html`, transcript);
        } catch (error) {
            Utility.logMessage('error', `[ Transcirpts ] I was unable to save transcript for: ${channel.name} for: ${error}`)
        }
    },
    
    parseMentionsAndLinks: function(content) {
        return content
            .replace(/<@!?(\d+)>/g, '<span style="color: #00AFF4;">@$1</span>') // Mentions
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color: #00AFF4;">$1</a>'); // Links
    },
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

    new Database().createTable('punishments', {
        id: 'TEXT PRIMARY KEY',
        punishments: "JSON"
    });

    new Database().createTable('invites', {
        id: 'TEXT PRIMARY KEY',
        invites: "JSON"
    })

    new Database().createTable('tickets', {
        id: 'TEXT PRIMARY KEY',
        guild: "TEXT",
        creator: "TEXT",
        staff: "JSON",
        reason: "TEXT",
        created: "TEXT",
        closed: "TEXT",
    })

    new Database().createTable('cooldowns', {
        id: 'TEXT PRIMARY KEY',
        time: "INTEGER"
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

