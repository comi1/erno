const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Utility = require('../../../utils/modules/Utility');

module.exports = {
    name: 'update',
    async execute(moi, args, client, { type, reply }) {
        const message = await reply(type, moi, {
            embeds: [
                Utility.embed({
                    title: 'Bot Update',
                    description: `Erno Bot is being updated, please wait...`,
                    timestamp: new Date(),
                    color: 'default',
                })
            ]
        });

        await updateFiles(message).then(async () => {
            await message.edit({
                embeds: [
                    Utility.embed({
                        title: 'Bot Update',
                        description: "> Bot has been updated successfully!",
                        timestamp: new Date(),
                        color: 'default',
                    })
                ]
            });
        });
    },
    aliases: ['upgrade'],
    usage: 'update',
    description: 'Updates the bot to the latest version.',
    category: 'admin',
    options: [],
    cooldown: Utility.cooldown.update
};

async function updateFiles(message) {
    const commandDir = './src/commands/';
    const eventDir = './src/events/';
    const utilsDir = './utils/';
    const packagePath = './package.json';

    const ensureDirectoryExistence = (filePath) => {
        const dirname = path.dirname(filePath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }
    };

    const compareAndUpdateFile = async (localFilePath, gitFilePath) => {
        try {
            ensureDirectoryExistence(localFilePath);

            if (!fs.existsSync(localFilePath)) {
                console.log(`File not found: ${localFilePath}, creating it...`);
                fs.writeFileSync(localFilePath, '');
            }

            const localContent = fs.readFileSync(localFilePath, 'utf8');
            const { data: gitContent } = await axios.get(gitFilePath);

            if (localContent !== gitContent) {
                console.log(`Update detected: ${localFilePath}`);
                fs.writeFileSync(localFilePath, gitContent, 'utf8');
            }
        } catch (error) {
            console.error(`Error updating ${localFilePath}:`, error.message);
        }
    };

    const iterateFiles = async (dirPath, gitBaseUrl) => {
        const folders = fs.readdirSync(dirPath);

        for (const folder of folders) {
            const folderPath = path.join(dirPath, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);

                for (const file of files) {
                    if (file === 'update.js' || file === 'Erno_Database.sqlite') continue;
                    const filePath = path.join(folderPath, file);
                    const gitFilePath = `${gitBaseUrl}/${folder}/${file}`;
                    await compareAndUpdateFile(filePath, gitFilePath);
                }
            }
        }
    };

    const gitCommandBaseUrl = 'https://raw.githubusercontent.com/comi1/erno/main/src/commands';
    const gitEventBaseUrl = 'https://raw.githubusercontent.com/comi1/erno/main/src/events';
    const gitUtilsBaseUrl = 'https://raw.githubusercontent.com/comi1/erno/main/utils';
    const gitPackageUrl = 'https://raw.githubusercontent.com/comi1/erno/main/package.json';

    await iterateFiles(commandDir, gitCommandBaseUrl);
    await iterateFiles(eventDir, gitEventBaseUrl);
    await iterateFiles(utilsDir, gitUtilsBaseUrl);

    try {
        const { data: newPackage } = await axios.get(gitPackageUrl);
        fs.writeFileSync(packagePath, JSON.stringify(newPackage, null, 2), 'utf8');

        const version = newPackage.version;
        Utility.logMessage('success', `[ Erno ] Updated bot to version ${version}`);
    } catch (error) {
        console.error(`Error updating package.json:`, error.message);
    }
}
