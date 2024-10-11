const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: "fetchinvites",
    async execute(moi, args, client, { type, reply }) {

        await Utility.updateInvites(moi.guild).then(s => {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.FetchInvites,
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member),
                            size: s.invites
                        }
                    })
                ]
            }, true)
        }) 

    },
    description: "Fetch all guild invites and update bot cache.",
    usage: "fetchinvites",
    category: "admin",
    aliases: ["fetchinv", "invitefetch"],
    options: [],
    cooldown: Utility.cooldown.fetchinvites
}