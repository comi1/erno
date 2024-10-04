const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const channel = Utility.config.Welcome;
        const message = Utility.messages.Welcome;

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
            .replace(/{memberCount}/g, member.guild.members.cache.filter(u => !u.user.bot).size + `${countAdd}`)

        const attachment = await Utility.createWelcomeImage(member.user, fixMessage)

        const sendTo = Utility.findChannel(member.guild, channel);
        if (sendTo) {
            sendTo.send({ files: [ attachment ]}).catch((e) => { })
        }
    }
}