const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member, client) {
        const channel = Utility.config.Leave;
        const message = Utility.messages.Leave;

        let memberCount = member.guild.members.cache.filter(u => !u.user.bot).size;

        let countAdd;
        if (memberCount % 10 === 1 && memberCount % 100 !== 11) {
            countAdd = 'st';
        } else if (memberCount % 10 === 2 && memberCount % 100 !== 12) {
            countAdd = 'nd';
        } else if (memberCount % 10 === 3 && memberCount % 100 !== 13) {
            countAdd = 'rd';
        } else {
            countAdd = 'th';
        }


        const fixMessage = message
            .replace(/{user-username}/g, member.user.username)
            .replace(/{user-id}/g, member.user.id)
            .replace(/{guild-name}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.members.cache.filter(u => !u.user.bot).size)

        const attachment = await Utility.createLeaveCard(member.user, fixMessage)

        const sendTo = Utility.findChannel(member.guild, channel);
        if (sendTo) {
            sendTo.send({ files: [ attachment ]}).catch((e) => { })
        }
    }
}