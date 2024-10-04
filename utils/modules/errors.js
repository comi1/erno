const fs = require("fs");
const Utility = require("./Utility");

Utility.logMessage("success", "[ System ] Error logger has been initialized successfully!")
module.exports = (error) => {
    if (!error) return;
    const { message, code } = error;

    if (fs.existsSync('./utils/errors')) {
        fs.mkdirSync('./utils/errors')
    }

    const toWrite = `==============================\n> Code: ${code? code : 'None'}\n> Message: ${message}\n==============================\n`

    fs.appendFile('./utils/errors/error_log.txt', toWrite, (err) => {
        if (err) throw err;
        Utility.logMessage('info', "[ System ] Error log has been saved !")
    });
}