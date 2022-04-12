import * as discord from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';
import fetch from 'node-fetch';

export let discordClient = undefined;
export const commands = new discord.Collection();

async function onMessage(message) {
    if (message.author.id === '560763794029019157') {
        const emoji = '729304124608348200';
        await msg.react(emoji);
    }
    const content = message.content;

    const informChannel = discordClient.channels._cache.get('963116330372964392');
    if (message.guild.id !== informChannel.guild.id) return;

    // do some checking of URL contents and report if it's a file URL
    try {
        const monsterUrlRegex =
            /(((http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
        const matches = content.match(monsterUrlRegex);
        if (matches) {
            for (const match of matches) {
                try {
                    const response = await fetch(match, { method: 'HEAD' });
                    const contentHeader = response.headers.get('Content-Disposition');
                    let name = contentHeader.split('filename=');
                    if (name.length > 1) {
                        const infoMessage = `posted file link \`${match}\` in message ${message.url}`;
                        console.log(`${message.author.tag} ${infoMessage}`);
                        await informChannel.send(`<@${message.author.id}> ${infoMessage}`);
                    }
                } catch (error) {
                    // don't do anything
                }
            }
        }
    } catch (error) {
        return;
    }
}

export const setup = async (discordToken, clientId) => {
    if (!discordToken) {
        throw new Error('No discord token specified');
    }
    const intents = new discord.Intents();
    intents.add(discord.Intents.FLAGS.GUILDS);
    intents.add(discord.Intents.FLAGS.GUILD_MESSAGES);
    intents.add(discord.Intents.FLAGS.DIRECT_MESSAGES);

    discordClient = new discord.Client({ intents });

    discordClient.on('interactionCreate', async (interaction) => {
        const command = commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    });

    discordClient.on('ready', async function () {
        setTimeout(() => {
            console.log(`Logged in as ${discordClient.user.tag}!`);
        }, 200);
    });

    discordClient.on('message', onMessage);

    await discordClient.login(discordToken);

    if (!clientId) {
        console.log('ClientID not specified - will not register commands!');
        return;
    }

    const COMMAND_DIR = './src/bot/commands';

    const commandFiles = fs.readdirSync(COMMAND_DIR).filter((file) => file.endsWith('.js'));

    const jsonCommands = [];

    for (const file of commandFiles) {
        const { default: command } = await import(`./commands/${file}`);
        if (command.hasParams) {
            command.data = await command.data(commandParams);
        }
        commands.set(command.data.name, command);
        jsonCommands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(discordToken);
    try {
        const guilds = await discordClient.guilds.fetch();
        for (const [id, guild] of guilds) {
            console.log(`Registering monitorbot (/) commands for ${guild.name} (${id}).`);
            const commandsToAdd = [];

            for (const command of jsonCommands) {
                const _command = commands.get(command.name);
                // some commands should only be registered based on predicates defined on the guild/server
                if (_command.predicate && !_command.predicate(guild)) {
                    continue;
                }
                commandsToAdd.push(command);
            }
            try {
                await rest.put(Routes.applicationGuildCommands(clientId, id), { body: commandsToAdd });
            } catch (error) {
                console.error(`Unable to register commands for ${guild.name}:`);
                console.error(error);
                continue;
            }
            console.log(`Successfully registered monitorbot (/) commands for ${guild.name}.`);
        }
    } catch (error) {
        console.error(error);
    }
};

export const sendMessageEmbed = async (title, author, message, channel, color = 0x00d166) => {
    if (!discordClient) {
        throw new Error('Client not initialized - cannot send embed message');
    }
    const embed = {
        color: color,
        title: title,
        author: {
            name: author,
        },
        description: message.message,
        fields: message.fields || null,
        timestamp: new Date(),
        footer: {
            text: 'Monitorbot',
        },
    };
    // Send the embed to the same channel as the message
    channel.send({ embed });
};
