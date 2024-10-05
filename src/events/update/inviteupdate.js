const { Events } = require('discord.js')
const Utility = require('../../../utils/modules/Utility')
module.exports = {
    name: Events.InviteCreate,
    once: false,
    execute: async (invite, client) => {
        await Utility.updateInvites(invite.guild);
        console.log(`New invite created: ${invite.url}`);
    }
}
