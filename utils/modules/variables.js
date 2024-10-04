const { Collection } = require("discord.js")

const variables = new Collection()

function setVariable(name, variable) {
    if (variables.has(name)) return;
    variables.set(name, variable);
}

function getVariable(name) {
    return variables.get(name);
}

function removeVariable(name) {
    variables.delete(name);
}

module.exports = {
    setVariable,
    getVariable,
    removeVariable,
}