const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'guildMemberAdd',
    onde: false,
    async execute(member, client) {

        await Utility.updateInvites(member.guild);
        setTimeout(async () => {
            const inviteData = await Utility.getUsedInvite(member, client);
            const dbInvites = await Utility.database.findOne('invites', { id: member.guild.id });

            if (!dbInvites) {
                await Utility.database.insert('invites', { id: member.guild.id, invites: JSON.stringify([{ userid: member.user.id, inviter: inviteData.Inviter }]) });
                return;
            }

            const invitesFound = JSON.parse(dbInvites.invites || '[]');

            if (!invitesFound.some(invite => invite.userid === member.user.id && invite.inviter === inviteData.Inviter)) {
                invitesFound.push({ userid: member.user.id, inviter: inviteData.Inviter });
                await Utility.database.update('invites', { invites: JSON.stringify(invitesFound) }, { id: member.guild.id });
            }
        }, 1000);
    }
};
