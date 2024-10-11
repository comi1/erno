const Utility = require("../../../utils/modules/Utility");
const { AttachmentBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {

        const captcha = await Utility.createCaptcha(7);
        const captchaAttachment = new AttachmentBuilder(captcha.buffer, { name: 'captcha.png' });
        const { enabled, disabled_dm_notification, verified_role, verification_logs } = Utility.config.Verification;
        
        if (!enabled) return;

        try {
            const sentMessage = await member.send({
                content: Utility.replaceVariables(Utility.messages.Verification, {
                    ...Utility.userVariables(member),
                    ...Utility.serverVariables(member.guild)
                }),
                files: [captchaAttachment]
            });

            const response = await Utility.waitForResponse(member.user.id, sentMessage.channel);
            const logsChannel = await Utility.findChannel(member.guild, verification_logs)

            if (response.content.toLowerCase() === captcha.text.toLowerCase()) {
                await sentMessage.channel.send({
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Verified,
                            variables: {
                                ...Utility.userVariables(member),
                                ...Utility.serverVariables(member.guild)
                            }

                        })
                    ]
                });
                const role = member.guild.roles.cache.find(r => r.name == verified_role) || member.guild.roles.cache.get(verified_role);
                if (role) {
                    await member.roles.add(role);
                }

                if (logsChannel) {
                    logsChannel.send({
                        embeds: [
                            Utility.embed({
                                ...Utility.messages.Verification_Logs,
                                variables: {
                                    ...Utility.userVariables(member),
                                    ...Utility.serverVariables(member.guild),
                                    "status": "Passed"
                                }
                            })
                        ]
                    })
                }
            } else {
                await sentMessage.channel.send({
                    embeds: [
                        Utility.embed({
                            ...Utility.messages.Unverified,
                            variables: {
                                ...Utility.userVariables(member),
                                ...Utility.serverVariables(member.guild)
                            }

                        })
                    ]
                })
                if (logsChannel) {
                    logsChannel.send({
                        embeds: [
                            Utility.embed({
                                ...Utility.messages.Verification_Logs,
                                variables: {
                                    ...Utility.userVariables(member),
                                    ...Utility.serverVariables(member.guild),
                                    "status": "Not passed"
                                }
                            })
                        ]
                    })
                }
            }
        } catch (error) {
            const fallbackChannel = Utility.findChannel(member.guild, disabled_dm_notification);
            if (fallbackChannel) {
                fallbackChannel.send({
                    content: Utility.replaceVariables(Utility.messages.Disabled_dm, {
                        ...Utility.userVariables(member),
                        ...Utility.serverVariables(member.guild)
                    })
                }).then((m) => {
                    setTimeout(() => {
                        m.delete().catch(() => { })
                    }, 60000);
                })
            }
        }
    }
};