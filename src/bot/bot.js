import * as discord from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';

export let discordClient = undefined;
export const commands = new discord.Collection();

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

    //discordClient.on('message', (msg) => {});

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
            console.log(`Registering monitorbot (/) commands for ${guild.name}.`);
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
                await rest.put(Routes.applicationGuildCommands(clientId, id), { body: jsonCommands });
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
