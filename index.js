// 🌐 Mini serveur Express pour maintenir le bot actif sur Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Modules Discord
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// 📌 CONFIGURATION DES IDS
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1385627871023861820';
const autoroleChannelId = '1385943465321566289';

// 🟢 READY
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 MESSAGE DE BIENVENUE
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error("❌ Salon de bienvenue introuvable.");

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  try {
    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.error("❌ Erreur d'envoi du message de bienvenue :", err);
  }
});

// 📜 COMMANDE !reglement
client.on('messageCreate', async message => {
  if (message.content === '!reglement' && !message.author.bot) {
    if (message.channel.id !== reglementChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du serveur')
      .setColor(0x3498db)
      .setDescription(
        `**🤝 Respect et Bienveillance**\n` +
        `Le respect entre membres est obligatoire. Aucune insulte ou propos haineux.\n\n` +
        `**🗣️ Comportement et Langage**\n` +
        `Langage approprié, pas de spam, reste poli.\n\n` +
        `**📌 Sujets sensibles**\n` +
        `Évite politique, religion, contenu NSFW.\n\n` +
        `**📢 Publicité et Partages**\n` +
        `Pas de pub sans autorisation. Liens non nuisibles autorisés.\n\n` +
        `**🛠️ Utilisation des salons**\n` +
        `Respecte les thèmes, ne spam pas les pings.\n\n` +
        `**👑 Staff et Sanctions**\n` +
        `Respecte les décisions du staff. En cas de souci, contacte un modérateur.`
      );

    const bouton = new ButtonBuilder()
      .setCustomId('reglement_valide')
      .setLabel('Valider')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('<:apple_success:1387148694230667448>');

    const row = new ActionRowBuilder().addComponents(bouton);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🎯 COMMANDE !autorole
client.on('messageCreate', async message => {
  if (message.content === '!autorole' && !message.author.bot) {
    if (message.channel.id !== autoroleChannelId) return;

    const msg = await message.channel.send({
      content: `🎯 **Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**\n\n` +
               `🔫 **Valorant**\n` +
               `💥 **Fortnite**\n` +
               `🚀 **Rocket League**\n` +
               `🎮 **Autres jeux**\n` +
               `🔞 **Salon trash**\n\n` +
               `💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.`
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

// 🧠 AJOUT OU RETRAIT DE RÔLES PAR RÉACTION
const roleMap = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Trash
};

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.channel.id !== autoroleChannelId || user.bot) return;

  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  if (member) member.roles.add(roleId).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.channel.id !== autoroleChannelId || user.bot) return;

  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  if (member) member.roles.remove(roleId).catch(console.error);
});

// ✅ BOUTON REGLEMENT CLIQUÉ
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'reglement_valide') {
    try {
      await interaction.member.roles.add(membreRoleId);
      await interaction.reply({ content: '✅ Règlement accepté, bienvenue !', ephemeral: true });
    } catch (err) {
      console.error("❌ Erreur attribution rôle membre :", err);
      await interaction.reply({ content: "❌ Une erreur s’est produite.", ephemeral: true });
    }
  }
});

// 🔐 Connexion
client.login(process.env.TOKEN);
