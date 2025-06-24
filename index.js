// 🌐 Serveur Express pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Config et modules Discord
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔢 IDs importants
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1385627871023861820';
const choixRoleChannelId = '1385943465321566289';

const roles = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Trash
};

// ✅ Bot prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  try {
    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.error("❌ Erreur message bienvenue :", err);
  }
});

// 🧠 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot || message.content !== '!autorole') return;

  const msg = await message.channel.send({
    content: `**🎯 Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**

**🔫 Valorant**  
**💥 Fortnite**  
**🚀 Rocket League**  
**🎮 Autres jeux**  
**🔞 Salon trash**

💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.`
  });

  for (const emoji of Object.keys(roles)) {
    await msg.react(emoji);
  }
});

// 🎭 Ajout / retrait des rôles avec réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || reaction.message.channelId !== choixRoleChannelId) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = roles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(roleId).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot || reaction.message.channelId !== choixRoleChannelId) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = roles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId).catch(console.error);
});

// 📜 Commande !reglement
client.on('messageCreate', async message => {
  if (message.author.bot || message.content !== '!reglement') return;

  const embed = new EmbedBuilder()
    .setTitle('📜 Règlement du Serveur Discord')
    .setColor(0x3498db)
    .setDescription(
      '**🤝 Respect et Bienveillance**  \n' +
      'Le respect entre membres est obligatoire.  \n' +
      'Pas d’insultes, harcèlement ou propos haineux.  \n\n' +
      '**🗣️ Comportement et Langage**  \n' +
      'Utilise un langage approprié, pas de spam ou pub.  \n' +
      'Reste poli même en cas de désaccord.  \n\n' +
      '**📌 Sujets sensibles**  \n' +
      'Évite politique, religion, contenu NSFW.  \n\n' +
      '**📢 Publicité et Partages**  \n' +
      'Pas de pub sans autorisation. Liens non nuisibles.  \n\n' +
      '**🛠️ Utilisation des salons**  \n' +
      'Respecte les thèmes, ne spam pas les pings.  \n\n' +
      '**👑 Staff et Sanctions**  \n' +
      'Respecte les décisions du staff. Contacte un modo en cas de souci.'
    );

  const bouton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accepte_reglement')
      .setLabel('Valider le règlement')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('☑️') // Emoji standard pour éviter les bugs
  );

  try {
    const channel = await client.channels.fetch(reglementChannelId);
    await channel.send({ embeds: [embed], components: [bouton] });
  } catch (err) {
    console.error("❌ Erreur envoi règlement :", err);
  }
});

// ✅ Bouton de validation du règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() || interaction.customId !== 'accepte_reglement') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(membreRoleId);

    await interaction.reply({
      content: `✅ Règlement accepté. Rôle 💎 Membre attribué à <@${member.id}> !`,
      ephemeral: true
    });
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout du rôle membre :", err);
    await interaction.reply({
      content: "❌ Une erreur est survenue lors de l'ajout du rôle.",
      ephemeral: true
    });
  }
});

// 🔐 Connexion du bot
client.login(process.env.TOKEN);
