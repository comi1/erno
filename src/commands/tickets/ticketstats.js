const Utility = require("../../../utils/modules/Utility");
const { ChannelType } = require('discord.js');
module.exports = {
    name: 'ticketstats',
    async execute(moi, args, client, { type, reply }) {

        const { Stats, No_Tickets } = Utility.messages.TicketStats;
        const tickets = await Utility.database.findAll('tickets');

        if (!tickets || tickets.length == 0) {
            return reply(type, moi, {
                embeds: [
                    Utility.embed({
                        ...No_Tickets,
                        variables: {
                            ...Utility.serverVariables(moi.guild),
                            ...Utility.userVariables(moi.member),
                        }
                    })
                ]
            });
        }

        const averageTime = await getAverageTime();
        const topTicketCreator = await getTopTicketCreator();
        const filterTicketByActivation = await filterTickets();

        const totalTickets = tickets.length;
        const openTickets = filterTicketByActivation.open;
        const closedTickets = filterTicketByActivation.closed;

        reply(type, moi, {
            embeds: [
                Utility.embed({
                    ...Stats,
                    variables: {
                        ...Utility.serverVariables(moi.guild),
                        ...Utility.userVariables(moi.member),
                        "total-tickets": totalTickets,
                        "open-tickets": openTickets,
                        "closed-tickets": closedTickets,
                        "solving-time": Utility.formatUserTime(averageTime.time),
                        "most-tickets-per-user": `<@${topTicketCreator.userId}>`
                    }
                })
            ]
        });
    },
    description: "Check the ticket stats!",
    category: 'tickets',
    aliases: ['tstats'],
    usage: "ticketstats",
    options: [],
    cooldown: Utility.cooldown.ticketstats
}

async function getTopTicketCreator() {
    try {
        const tickets = await Utility.database.findAll('tickets');

        if (!tickets || tickets.length === 0) {
            return;
        }

        const ticketCountByUser = {};

        tickets.forEach(ticket => {
            const creator = ticket.creator;
            if (ticketCountByUser[creator]) {
                ticketCountByUser[creator] += 1;
            } else {
                ticketCountByUser[creator] = 1;
            }
        });

        let topCreator = null;
        let maxTickets = 0;

        for (const [userId, count] of Object.entries(ticketCountByUser)) {
            if (count > maxTickets) {
                maxTickets = count;
                topCreator = userId;
            }
        }

        return topCreator ? { userId: topCreator, ticketCount: maxTickets } : null;
    } catch (error) {
        console.error('Error fetching the user with the most tickets:', error);
    }
}

async function filterTickets() {
    const tickets = await Utility.database.findAll('tickets');
    let open = 0;
    let closed = 0;
    
    for (const ticket of tickets) {
        if (ticket.closed !== '0') closed++;
        else open++;
    }

    return { open: open, closed: closed };
}

async function getAverageTime() {
    const tickets = await Utility.database.findAll('tickets');
    let timeSpent = 0;
    let closedTickets = tickets.filter(t => t.closed !== '0');

    for (const ticket of closedTickets) {
        const createdAt = parseFloat(ticket.created);
        const closedAt = parseFloat(ticket.closed);
        timeSpent += closedAt - createdAt;
    }

    if (timeSpent === 0 || closedTickets.length === 0) {
        return { time: 0 };
    }

    const averageTime = timeSpent / closedTickets.length;
    
    return { time: averageTime };
}
