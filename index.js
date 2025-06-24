// 🌐 Mini serveur Express (nécessaire pour Render ou UptimeRobot)
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Modules Discord.js
require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ButtonBuilder, 
  ActionRowBuilder, 
  ButtonStyle 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🆔 ID des salons et rôles
const welcomeChannelId = '1385999517983440967'; // Salon de bienvenue
const reglementChannelId = '1385409088824938652'; // Salon du règlement
const membreRoleId = '1385627871023861820'; // Rôle à attribuer après clic
const emojiAccept = '<:apple_success:1387148694230667448>'; // Emoji personnalisé

// ✅ Quand le bot est prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue automatique
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

// 📜 Commande !reglement pour poster le règlement
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content !== '!reglement') return;

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("📜 Règlement du Serveur Discord")
    .setDescription(
      "**🤝 Respect et Bienveillance**\n" +
      "Le respect entre membres est obligatoire.\n" +
      "On peut rire, s'insulter dans la bonne humeur, **pas de toxicité ou harcèlement**.\n\n" +
      "**🗣️ Comportement et Langage**\n" +
      "Pas de propos choquants ou de spam. Reste poli même en cas de désaccord.\n\n" +
      "**📌 Sujets sensibles**\n" +
      "Pas de politique, religion, ou NSFW (même en privé sans accord).\n\n" +
      "**📣 Publicité et Partages**\n" +
      "Pas de pub sans autorisation. Liens OK s’ils sont sûrs.\n\n" +
      "**🛠️ Utilisation des salons**\n" +
      "Respecte chaque salon. Ne ping pas inutilement.\n\n" +
      "**👑 Staff et Sanctions**\n" +
      "Le staff est là pour vous aider. Sanctions possibles si non-respect."
    );

  const button = new ButtonBuilder()
    .setCustomId('accept_rules')
    .setLabel("✅ J'accepte le règlement")
    .setStyle(ButtonStyle.Primary)
    .setEmoji(emojiAccept);

  const row = new ActionRowBuilder().addComponents(button);

  await message.channel.send({ embeds: [embed], components: [row] });
});

// 🎯 Action quand un utilisateur clique sur le bouton
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'accept_rules') {
    const role = interaction.guild.roles.cache.get(membreRoleId);
    if (!role) {
      return interaction.reply({ content: "❌ Rôle introuvable", ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: "✅ Règlement accepté, rôle attribué !", ephemeral: true });
    } catch (error) {
      console.error("❌ Erreur attribution rôle :", error);
      await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
    }
  }
});

// 🔐 Connexion
client.login(process.env.TOKEN);
