const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'embed',
    async execute(moi, args, client, { type, reply }) {

        const name = type === 'message' ? args?.slice(1).join(" ") : moi.options.getString('embed');
        let channel = Utility.fetchChannel(moi, type, args[0])

        if (!name || !channel) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Usage,
                        variables: {
                            usage: `${await Utility.prefix(moi.guild)}${module.exports.usage}`
                        }
                    })
                ]
            });
        }

        if (!Utility.embeds[name]) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        title: "Error",
                        description: `The embed '${name}' does not exist in embeds.yml.`,
                        color: "error",
                        timestamp: true
                    })
                ]
            });
        }

        channel.send({
            content: Utility.embeds[name].content ? Utility.replaceVariables(Utility.embeds[name].content, {
                ...Utility.serverVariables(moi.guild),
                ...Utility.userVariables(moi.member),
                ...Utility.botVariables(client)
            }) : "",
            embeds: [
                Utility.embed({
                    ...Utility.embeds[name],
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        ...Utility.botVariables(client)
                    }
                })
            ]
        }).then(() => {
            reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.messages.Embed,
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member),
                            ...Utility.botVariables(client),
                            ...Utility.channelVariables(channel),
                            "embed-name": name
                        }
                    })
                ]
            });
        }).catch((e) => { });
    },
    description: "Send the embed from embeds.yml",
    category: "admin",
    usage: ["embed [channel] [embed name]"],
    aliases: ["emb"],
    options: [
        {
            name: "channel",
            type: 7,
            description: "The channel to send the embed to.",
            required: true,
            channel_types: [0, 5] 
        },
        {
            name: "embed",
            type: 3,
            description: "The name of the embed to send.",
            required: true,
            choices: Object.keys(Utility.embeds).map(embed => ({
                name: Utility.capitalizeFirstLetter(embed),
                value: embed
            }))
        }
    ],
    cooldown: Utility.cooldown.embed
};
