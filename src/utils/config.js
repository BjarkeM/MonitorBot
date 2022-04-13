import * as fs from 'fs';

export const getConfig = function () {
    if (!fs.existsSync('config.json')) {
        fs.writeFileSync(
            'config.json',
            JSON.stringify(
                {
                    // discord bot token
                    discordToken: '',
                    // bot ID for commands
                    clientId: '',
                    informChannel: '',
                },
                void 0,
                4,
            ),
        );
        throw new Error('Created a new config. Fill it in to start.');
    }

    return JSON.parse(fs.readFileSync('config.json'));
};
