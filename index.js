const { SlashCommandBuilder } = require('discord.js');
const { REST, Routes } = require('discord.js');

const roleChannelId = '1385943465321566289'; // salon #roles

const emojiRoleMap = {
  '🔫': 'Valorant',
  '💥': 'Fortnite',
  '🚀': 'Rocket League',
  '🎮': 'Autres jeux',
  '🔞': 'Salon trash'
};

// ✅ Enregistrer la commande slash /autorole (à faire une seule fois)
client.once('ready', async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName('autorole')
      .setDescription('Envoie le message pour choisir des rôles.')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("✅ Commande /autorole enregistrée !");
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement :", err);
  }
});

// 🎯 Quand on tape /autorole
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'autorole') return;

  const channel = await client.channels.fetch(roleChannelId);
  if (!channel) return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle("🎯 Choisis tes jeux préférés")
    .setDescription(
      `Clique sur les réactions ci-dessous pour obtenir un rôle :\n\n` +
      `🔫 Valorant\n💥 Fortnite\n🚀 Rocket League\n🎮 Autres jeux\n🔞 Salon trash\n\n` +
      `💡 Tu peux en proposer d'autres dans le salon discussion !`
    )
    .setColor(0xffc300);

  try {
    const message = await channel.send({ embeds: [embed] });
    for (const emoji of Object.keys(emojiRoleMap)) {
      await message.react(emoji);
    }
    await interaction.reply({ content: "✅ Message posté dans le salon des rôles !", ephemeral: true });
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi :", err);
    interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
  }
});

// 📥 Quand un membre clique sur une réaction
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;

  const emoji = reaction.emoji.name;
  const roleName = emojiRoleMap[emoji];
  if (!roleName) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
  if (role) await member.roles.add(role);
});

// 📤 Quand un membre retire une réaction
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;

  const emoji = reaction.emoji.name;
  const roleName = emojiRoleMap[emoji];
  if (!roleName) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
  if (role) await member.roles.remove(role);
});
