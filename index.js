const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ID du salon #bienvenue
const welcomeChannelId = '1385999517983440967';

// ID du salon autorôle
const roleMessageChannelId = '1385943465321566289';

// Rôles disponibles avec leurs emojis et IDs (à remplacer avec tes vrais IDs de rôles Discord)
const rolesData = [
  { emoji: '🔫', label: 'Valorant', roleId: 'ID_ROLE_VALORANT' },
  { emoji: '💥', label: 'Fortnite', roleId: 'ID_ROLE_FORTNITE' },
  { emoji: '🚀', label: 'Rocket League', roleId: 'ID_ROLE_ROCKET_LEAGUE' },
  { emoji: '🎮', label: 'Autres jeux', roleId: 'ID_ROLE_AUTRES' },
  { emoji: '🔞', label: 'Trash', roleId: 'ID_ROLE_TRASH' },
];

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 🎯 Gestion du clic sur les boutons d'autorôle
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const clicked = rolesData.find(r => r.label === interaction.customId);
  if (!clicked) return;

  const role = interaction.guild.roles.cache.get(clicked.roleId);
  if (!role) return;

  const hasRole = interaction.member.roles.cache.has(clicked.roleId);
  try {
    if (hasRole) {
      await interaction.member.roles.remove(role);
      await interaction.reply({ content: `❌ Rôle ${clicked.label} retiré`, ephemeral: true });
    } else {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: `✅ Rôle ${clicked.label} ajouté`, ephemeral: true });
    }
  } catch (err) {
    console.error("Erreur rôle:", err);
    await interaction.reply({ content: `❌ Erreur lors de la gestion du rôle`, ephemeral: true });
  }
});

// 🛠️ Commande admin pour envoyer le message d'autorôle
client.on('messageCreate', async message => {
  if (message.content === '!autorole' && message.member.permissions.has('Administrator')) {
    const row = new ActionRowBuilder().addComponents(
      rolesData.map(role =>
        new ButtonBuilder()
          .setCustomId(role.label)
          .setLabel(`${role.emoji} ${role.label}`)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const embed = new EmbedBuilder()
      .setTitle("🎯 Choisis tes jeux préférés !")
      .setDescription(
        `Clique sur les boutons ci-dessous pour ajouter ou retirer les rôles associés.\n\nAucun rôle n’a de permission spéciale, ils servent juste à t'identifier avec la communauté et recevoir les bons ping 🔔\n\n💡 Si tu veux proposer d’autres jeux, passe dans le salon discussion !`
      )
      .setColor(0x00AE86);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error("❌ Salon #bienvenue introuvable");

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  try {
    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
    console.log(`✅ Message de bienvenue envoyé pour ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du message :", err);
  }
});

// 🔐 Connexion avec le token
client.login(process.env.TOKEN);

