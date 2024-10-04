const fs = require('fs');
const YAML = require('yaml');

function fixFormat(text) {
    return text
        .replace(/("|')?~(\d+)?("|')?:\s("|')?.+("|')?/g, match => "# " + match.replace(/("|')?~(\d+)?("|')?:\s/g, '').replace(/("|')/g, '')) 
        .replace(/("|')?~(c(\d+|))?("|')?:\s("|')?.+(\n {2}.+|)("|')/g, match => {
            let comment = match.replace(/("|')?~(c(\d+|))?("|')?:\s/g, '');
            return (match.includes("#") ? "" : "#") + comment.substring(comment.startsWith("\"") || comment.startsWith("'") ? 1 : 0, comment.endsWith("\"") || comment.endsWith("'") ? comment.length - 1 : undefined).replace(/.+\n\s+/g, m => m.replace(/\n\s+/g, " ").replace(/\\"/g, "\""));
        }) 
        .replace(/("|')?~(l(\d+|))?("|')?:\s("|')?.+("|')?/g, ""); 
}
module.exports = class Config {
    constructor(path, defaultcontent, options = {}) {
        this.path = path;

        const createConfig = () => {
            fs.writeFileSync(path, fixFormat(YAML.stringify(defaultcontent)), (err) => {
                if (err) return err;
            });
        };

        if (!fs.existsSync(path)) {
            if (!fs.existsSync('./addons')) {
                fs.mkdirSync('./addons', (err) => { if (err) console.log(err); });
                createConfig();
            } else createConfig();
            return YAML.parse(fs.readFileSync(path, 'utf-8'), { prettyErrors: true });
        } else {
            if (options.devMode) {
                createConfig();

                return YAML.parse(fs.readFileSync(path, 'utf-8'), { prettyErrors: true });
            }

            else return YAML.parse(fs.readFileSync(path, 'utf-8'), { prettyErrors: true });
        }
    }
};