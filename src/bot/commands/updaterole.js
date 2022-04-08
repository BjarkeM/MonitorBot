const { SlashCommandBuilder } = await import('@discordjs/builders');

const roles = [1, 2, 3, 4, 5, 6, 7].map((num) => `role${num}`);

function addCommandOptions(action, builder) {
    const to_from = action == 'Add' ? 'to' : 'from';

    for (const role of roles) {
        builder.addRoleOption((option) => option.setName(role).setDescription(`${action} role ${to_from} your roles.`));
    }
    return builder;
}

export default {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Used to add/remove roles from yourself.')
        .addSubcommand((builder) => {
            return addCommandOptions('Add', builder.setName('add').setDescription('Add role'));
        })
        .addSubcommand((builder) => {
            return addCommandOptions('Remove', builder.setName('remove').setDescription('Remove role'));
        }),
    async execute(interaction) {
        await updateRole(interaction);
    },
};

async function updateRole(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.user;
    const updatedRoles = [];
    const add_command = interaction.options._subcommand === 'add';
    const action = add_command ? 'add' : 'remove';
    const to_from = add_command ? 'to' : 'from';

    let roleError = false;

    for (const opt of roles) {
        const role = interaction.options.getRole(opt);
        if (!role) continue;
        console.log(`Attempting to update role "${role.name}" for ${user.tag}`);

        try {
            if (add_command) {
                await interaction.member.roles.add(role);
            } else {
                await interaction.member.roles.remove(role);
            }
            updatedRoles.push(role.name);
        } catch (error) {
            console.log(`Unable to ${action} role "${role.name}" ${to_from} ${user.tag}:`);
            console.error(error);
            roleError = true;
            continue;
        }
        console.log(`Updated role "${role.name}" for ${user.tag}`);
    }

    let reply = '';
    if (updatedRoles.length) {
        reply = 'Roles succesfully updated!' + (add_command ? ' Added: ' : ' Removed: ') + `${updatedRoles.join(', ')}`;
    } else {
        reply = 'No roles were updated.';
    }
    if (roleError) {
        reply = `You are a naughty boi. You attempted to ${action} a guarded role.`;
    }
    return await interaction.editReply({
        ephemeral: true,
        content: reply,
    });
}
