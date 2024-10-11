const InvitesTracker = require('@androz2091/discord-invites-tracker');
const Utility = require('./Utility');

Utility.logMessage('success', `[ Invites Module ] Successfully loaded invitation module!`)
module.exports = async (client) => {
    const tracker = InvitesTracker.init(client, {
        fetchGuilds: true,
        fetchVanity: true,
        fetchAuditLogs: true
    });

    tracker.on('guildMemberAdd', async (member, type, invite) => {
        const channel = Utility.findChannel(member.guild, Utility.config.InviteChannel);
        if (type === 'normal') {
            if (!channel) return;
            channel.send({
                embeds: [
                    Utility.embed({
                        title: "🎉 | Invites",
                        description: Utility.messages.InviteMessage,
                        color: 'default',
                        timestamp: true,
                        variables: {
                            "inviter-id": invite.inviter.id,
                            "inviter-username": invite.inviter.username,
                            "inviter-mention" : `<@${invite.inviter.id}>`,
                            "inviter-avatar": invite.inviter.displayAvatarURL({ size: 2048 }),
                            "invite-code": invite.code,
                            "invite-url": invite.url,                            
                            ...Utility.userVariables(member),
                            ...Utility.serverVariables(member.guild)
                        }
                    })
                ]
            })
        }
    });
};