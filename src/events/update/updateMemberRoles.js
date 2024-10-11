const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const { enabled, roles } = Utility.config?.JoinRoles;

        if (!enabled) return;
        if(!Array.isArray(roles)) return;

        for (const role of roles) {
            const roleToAdd = member.guild.roles.cache.find(r => r.name == role) || member.guild.roles.cache.get(role);
            if (roleToAdd) {
                try {
                    member.roles.add(roleToAdd.id)
                } catch (error) {
                    Utility.logMessage('error', `[Join Roles] Failed to add role "${role}" to ${member.user.tag}. Error: ${error.message}`);
                }
            }
        }
    }
}