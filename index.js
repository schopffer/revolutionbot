// 📦 Dépendances
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events } = require('discord.js');

// 🌐 Serveur Express pour garder le bot actif
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 📌 IDs
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const roleMembreId = '1387170961769631817';
const emojiValidation = '1387148694230667448'; // apple_success
const choixRoleChannelId = '1385943465321566289';
const rolesEmojis = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005', // Trash
};

// ✅ Quand le bot est prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error('❌ Salon #bienvenue introuvable');

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
});

// 🎮 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!autorole') {
    const msg = await message.channel.send({
      content: `**🎯 Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**\n\n` +
        `**🔫 Valorant**\n` +
        `**💥 Fortnite**\n` +
        `**🚀 Rocket League**\n` +
        `**🎮 Autres jeux**\n` +
        `**🔞 Salon trash**\n\n` +
        `💡 N’hésite pas à proposer d’autres jeux dans le salon discussions.`
    });
    for (const emoji of Object.keys(rolesEmojis)) {
      await msg.react(emoji);
    }
  }
});

// 🎭 Attribution de rôle via réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;

  if (reaction.message.channel.id === choixRoleChannelId) {
    const roleId = rolesEmojis[reaction.emoji.name];
    if (!roleId) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    member.roles.add(roleId).catch(console.error);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;

  if (reaction.message.channel.id === choixRoleChannelId) {
    const roleId = rolesEmojis[reaction.emoji.name];
    if (!roleId) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    member.roles.remove(roleId).catch(console.error);
  }
});

// 📘 Commande !reglement
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!reglement') {
    const embed = new EmbedBuilder()
      .setTitle(':scroll: Règlement du Serveur Discord')
      .setColor(0x3498db)
      .setDescription(
        '**🤝 Respect et Bienveillance**\n' +
        'Le respect entre membres est obligatoire. Pas de toxicité.\n\n' +
        '**🗣️ Comportement et Langage**\n' +
        'Pas de spam, pub, propos choquants.\n\n' +
        '**📌 Sujets sensibles**\n' +
        'Pas de politique, NSFW ou sujets polémiques.\n\n' +
        '**📣 Publicité et Partages**\n' +
        'Pas de lien douteux, ni pub externe sans accord.\n\n' +
        '**🛠️ Utilisation des salons**\n' +
        'Respecte la thématique et ne ping pas pour rien.\n\n' +
        '**👑 Staff et Sanctions**\n' +
        'Les décisions du staff sont à respecter. Sanctions possibles.'
      );

    const button = new ButtonBuilder()
      .setCustomId('validate_rules')
      .setLabel('Valider ✅')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('<:apple_success:1387148694230667448>');

    const row = new ActionRowBuilder().addComponents(button);

    const channel = await client.channels.fetch(reglementChannelId);
    if (!channel) return console.error('❌ Salon #règlement introuvable');
    await channel.send({ embeds: [embed], components: [row] });
  }
});

// ✅ Interaction bouton règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'validate_rules') {
    await interaction.member.roles.add(roleMembreId);
    await interaction.reply({ content: '✅ Règlement accepté. Rôle attribué !', ephemeral: true });
  }
});

// 🔐 Connexion
client.login(process.env.TOKEN);
