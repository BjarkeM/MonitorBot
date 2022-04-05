const { SlashCommandBuilder } = await import('@discordjs/builders');

export default {
    data: new SlashCommandBuilder().setName('monitorbot').setDescription('Information about Monitorbot'),
    async execute(interaction) {
        await info(interaction);
    },
    predicate: (guild) => guild.id === '224224133934743552',
};

async function info(interaction) {
    const reply = `This bot is created for the Monitor Enthusiasts Discord. If you are interested in joining, visit https://discord.gg/8QQ96jAUN9
The source code for the bot is available on Github: https://github.com/BjarkeM/MonitorBot
Found a problem? Visit https://github.com/BjarkeM/MonitorBot/issues and create an issue.
PS: Ultrawides are the best.
`;
    await interaction.reply({ ephemeral: true, content: reply });
}
