// 🌐 Mini serveur Express pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Modules Discord
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🎯 IDs
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const reglementRoleId = '1385627871023861820';
const emojiAccept = '<:apple_success:1387148694230667448>';

// 🚀 Rôles jeux par emojis
const roleMessageChannelId = '1385943465321566289';
const roleEmojis = {
  '🔫': '1385980913728487455',       // Valorant
  '💥': '1386063811907162183',       // Fortnite
  '🚀': '1385983179034202112',       // Rocket League
  '🎮': '1385982774619672646',       // Autres jeux
  '🔞': '1386695919675769005'        // Trash
};

// ✅ Bot prêt
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

// 👋 Bienvenue
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
  } catch (err) {
    console.error("❌ Erreur d’envoi :", err);
  }
});

// 📌 !reglement
client.on('messageCreate', async message => {
  if (message.author.bot || message.content !== '!reglement') return;

  const reglementChannel = message.guild.channels.cache.get(reglementChannelId);
  if (!reglementChannel) return console.error("❌ Salon règlement introuvable");

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("📜 Règlement du Serveur Discord")
    .setDescription(
      "**🤝 Respect et Bienveillance**\n" +
      "Le respect est obligatoire. Humour oui, harcèlement non.\n\n" +
      "**🗣️ Comportement et Langage**\n" +
      "Pas de spam, ni propos choquants. Soyez polis.\n\n" +
      "**📌 Sujets sensibles**\n" +
      "Pas de NSFW ou sujets sensibles sans salon dédié.\n\n" +
      "**📣 Publicité et Partages**\n" +
      "Pas de pub sans accord. Liens OK si fiables.\n\n" +
      "**🛠️ Utilisation des salons**\n" +
      "Respecte les thèmes, ne ping pas inutilement.\n\n" +
      "**👑 Staff et Sanctions**\n" +
      "Le staff aide, les règles sont à suivre."
    );

  const button = new ButtonBuilder()
    .setCustomId('accept_rules')
    .setLabel("J'accepte le règlement")
    .setStyle(ButtonStyle.Primary)
    .setEmoji(emojiAccept);

  const row = new ActionRowBuilder().addComponents(button);

  await reglementChannel.send({ embeds: [embed], components: [row] });
});

// ✅ Acceptation du règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'accept_rules') {
    try {
      const role = interaction.guild.roles.cache.get(reglementRoleId);
      if (!role) return;

      await interaction.member.roles.add(role);
      await interaction.reply({ content: "✅ Règlement accepté !", ephemeral: true });
    } catch (
