const { SlashCommandBuilder } = await import('@discordjs/builders');

export default {
    data: new SlashCommandBuilder()
        .setName('rolehelp')
        .setDescription('Information about role management commands (/role (add|remove)'),
    async execute(interaction) {
        await rolehelp(interaction);
    },
};

async function rolehelp(interaction) {
    let reply = `To manage your roles, use one of the commands \`/role add [role]\` or \`/role remove [role]\`
When selecting a role to add or remove, you can search roles by typing in a name (e.g. the string \`144\` for the 144+ hz role)
Use \`/rolehelp\` for this info.
        `;
    const ephemeral = interaction.channel.id !== '376201454236729345'; // #role-requests on Monitor discord
    await interaction.reply({ content: reply, ephemeral });
}
