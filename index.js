// ✅ Serveur Express pour garder le bot actif (Render)
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 🤖 Configuration du bot Discord
const { Client, GatewayIntentBits, EmbedBuilder, Partials, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ID des salons et rôles
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1387170961769631817';
const autoroleChannelId = '1385943465321566289';

const rolesByEmoji = {
  '🔫': '1385980913728487455',
  '💥': '1386063811907162183',
  '🚀': '1385983179034202112',
  '🎮': '1385982774619672646',
  '🔞': '1386695919675769005'
};

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
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
    console.error("❌ Erreur lors de l'envoi du message de bienvenue :", err);
  }
});

// 📌 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!autorole') {
    const embed = new EmbedBuilder()
      .setTitle('🎯 Choisis tes jeux préférés !')
      .setDescription(
        '**Clique sur les réactions ci-dessous pour recevoir les rôles associés :**\n\n' +
        '**🔫 Valorant**\n**💥 Fortnite**\n**🚀 Rocket League**\n**🎮 Autres jeux**\n**🔞 Salon trash**\n\n' +
        '💡 N’hésite pas à proposer d’autres jeux dans le salon discussions.'
      )
      .setColor(0x3498DB);

    try {
      const msg = await message.channel.send({ embeds: [embed] });
      for (const emoji of Object.keys(rolesByEmoji)) {
        await msg.react(emoji);
      }
    } catch (err) {
      console.error("❌ Impossible d’envoyer ou réagir au message autorole :", err);
    }
  }
});

// ✅ Gérer les réactions d'autorôle
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.channel.id !== autoroleChannelId) return;
  const roleId = rolesByEmoji[reaction.emoji.name];
  if (!roleId) return;
  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(roleId).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.channel.id !== autoroleChannelId) return;
  const roleId = rolesByEmoji[reaction.emoji.name];
  if (!roleId) return;
  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId).catch(console.error);
});

// 📘 Commande !reglement avec bouton personnalisé
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!reglement') {
    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur Discord')
      .setColor(0x3498DB)
      .setDescription(
        '**🤝 Respect et Bienveillance**  \n' +
        'Le respect entre membres est obligatoire.  \n' +
        'Pas d’insultes, harcèlement ou propos haineux.  \n\n' +
        '**🗣️ Comportement et Langage**  \n' +
        'Utilise un langage approprié, pas de spam ou pub.  \n' +
        'Reste poli même en cas de désaccord.  \n\n' +
        '**📌 Sujets sensibles**  \n' +
        'Évite les discussions politiques/religieuses.  \n' +
        'Pas de contenu NSFW (même en MP sans accord).  \n\n' +
        '**📣 Publicité et Partages**  \n' +
        'Pas de pub sans autorisation.  \n' +
        'Les liens doivent être sûrs.  \n\n' +
        '**🛠️ Utilisation des salons**  \n' +
        'Respecte les thèmes de chaque salon.  \n' +
        'Ne ping pas pour rien.  \n\n' +
        '**👑 Staff et Sanctions**  \n' +
        'Le staff est là pour aider.  \n' +
        'Respecte leurs décisions.  \n' +
        'Les sanctions peuvent aller du mute au ban.'
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('reglement_accept')
        .setLabel('Valider le règlement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji({ name: 'apple_success', id: '1387148694230667448', animated: false })
    );

    try {
      const channel = client.channels.cache.get(reglementChannelId);
      if (!channel) return console.error("❌ Salon de règlement introuvable");
      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error("❌ Erreur lors de l’envoi du règlement :", err);
    }
  }
});

// 🎯 Gestion du bouton règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'reglement_accept') {
    try {
      await interaction.member.roles.add(membreRoleId);
      await interaction.reply({ content: '✅ Règlement accepté, bienvenue !', ephemeral: true });
    } catch (err) {
      console.error("❌ Erreur lors de l’attribution du rôle membre :", err);
    }
  }
});

client.login(process.env.TOKEN);
