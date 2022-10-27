const { readdirSync } = require('fs');

module.exports = (app, shit, next) => {
    const eventFolders = readdirSync('./src/router');

    for (const folder of eventFolders) {
        const eventFiles = readdirSync(`./src/router/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../router/${folder}/${file}`);

            if (!event) continue;

            app.register(event, { prefix: `/api/${folder}/${file.split('.')[0]}` })
        }
    }

    next();
};