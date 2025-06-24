// 📜 Système de Règlement avec Validation
require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Partials, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const welcomeChannelId = '1385999517983440967';
const autoroleChannelId = '1385943465321566289';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1385627871023861820';
const customEmojiId = '1387148694230667448';
const customEmojiName = 'apple_success';

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

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

// 🎯 !autorole command
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!autorole') {
    const msg = await message.channel.send({
      content: `**🎯 Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**\n\n**🔫 Valorant**\n**💥 Fortnite**\n**🚀 Rocket League**\n**🎮 Autres jeux**\n**🔞 Salon trash**\n\n💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.`
    });

    try {
      await msg.react('🔫');
      await msg.react('💥');
      await msg.react('🚀');
      await msg.react('🎮');
      await msg.react('🔞');
    } catch (err) {
      console.error("❌ Impossible d’ajouter les réactions :", err);
    }
  }
});

// 📜 !reglement command
client.on('messageCreate', async message => {
  if (message.author.bot || message.channel.id !== reglementChannelId) return;

  if (message.content === '!reglement') {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📜 Règlement du Serveur Discord')
      .setDescription(`**🤝 Respect et Bienveillance**\n
- Le respect entre membres est obligatoire.\n- Aucune forme d’insulte, discrimination, harcèlement ou propos haineux ne sera tolérée.\n- On peut rire et s'insulter dans la bonne humeur, mais pas de toxicité ni de harcèlement.\n
**🗣️ Comportement et Langage**\n
- Utilise un langage approprié, évite les propos vulgaires ou choquants.\n- Le spam (messages répétés, flood, pub non autorisée) est interdit.\n- Reste poli même en cas de désaccord.\n
**📌 Sujets sensibles**\n
- Discussions politiques, religieuses ou autres sujets sensibles à éviter (sauf salons dédiés).\n- Pas de contenu NSFW même en message privé si non consenti.\n
**📢 Publicité et Partages**\n
- Aucune pub sans autorisation.\n- Les liens sont autorisés s’ils sont sûrs.\n
**🛠️ Utilisation des salons**\n
- Respecte les thématiques des salons.\n- Ne ping pas inutilement.\n
**👑 Staff et Sanctions**\n
- Le staff est là pour aider.\n- Respecte leurs décisions.\n- Le non-respect peut entraîner sanction.`)
      .setFooter({ text: 'Merci de lire attentivement 💙' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('validate_rules')
        .setLabel('Valider')
        .setEmoji(`<:${customEmojiName}:${customEmojiId}>`)
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error("❌ Erreur lors de l’envoi du règlement :", err);
    }
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'validate_rules') {
    const role = interaction.guild.roles.cache.get(membreRoleId);
    if (!role) return interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: `✅ Règlement accepté, tu as maintenant accès au serveur !`, ephemeral: true });
    } catch (err) {
      console.error('❌ Erreur lors de l’ajout du rôle :', err);
      await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
