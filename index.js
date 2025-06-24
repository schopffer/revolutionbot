// 🌐 Serveur web express pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 🤖 Configuration du bot Discord
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 📌 IDs importants
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1387170961769631817';
const choixRoleChannelId = '1385943465321566289';

const roles = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Trash
};

// ✅ Quand le bot est prêt
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

// 📜 !reglement → message embed + bouton
client.on('messageCreate', async message => {
  if (message.author.bot || message.content !== '!reglement') return;

  const embed = new EmbedBuilder()
    .setTitle('📜 Règlement du Serveur Discord')
    .setColor(0x3498db)
    .setDescription(
      '**🤝 Respect et Bienveillance**\n' +
      'Le respect entre membres est obligatoire. Aucune insulte ou propos haineux.\n\n' +
      '**🗣️ Comportement et Langage**\n' +
      'Langage approprié, pas de spam, reste poli.\n\n' +
      '**📌 Sujets sensibles**\n' +
      'Évite politique, religion, contenu NSFW.\n\n' +
      '**📢 Publicité et Partages**\n' +
      'Pas de pub sans autorisation. Liens non nuisibles autorisés.\n\n' +
      '**🛠️ Utilisation des salons**\n' +
      'Respecte les thèmes, ne spam pas les pings.\n\n' +
      '**👑 Staff et Sanctions**\n' +
      'Respecte les décisions du staff. Contacte un modo en cas de souci.'
    );

  const bouton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accepte_reglement')
      .setLabel('Valider le règlement')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('☑️')
  );

  try {
    const channel = await client.channels.fetch(reglementChannelId);
    await channel.send({ embeds: [embed], components: [bouton] });
    console.log('✅ Message de règlement envoyé');
  } catch (err) {
    console.error("❌ Erreur envoi règlement :", err);
  }
});

// 🎯 Clic sur bouton règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'accepte_reglement') return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  try {
    await member.roles.add(membreRoleId);
    await interaction.reply({
      content: `✅ Tu as accepté le règlement ! Rôle attribué à <@${member.id}>`,
      ephemeral: true
    });
    console.log(`✅ Rôle membre donné à ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Erreur attribution rôle règlement :", err);
    await interaction.reply({
      content: `❌ Erreur lors de l'attribution du rôle. Contacte un admin.`,
      ephemeral: true
    });
  }
});

// 🧠 !autorole → message avec réactions
client.on('messageCreate', async message => {
  if (message.author.bot || message.content !== '!autorole') return;

  const msg = await message.channel.send({
    content: `**🎯 Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**\n\n` +
      '**🔫 Valorant**\n' +
      '**💥 Fortnite**\n' +
      '**🚀 Rocket League**\n' +
      '**🎮 Autres jeux**\n' +
      '**🔞 Salon trash**\n\n' +
      '💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.'
  });

  for (const emoji of Object.keys(roles)) {
    try {
      await msg.react(emoji);
    } catch (err) {
      console.error(`❌ Erreur en ajoutant réaction ${emoji} :`, err);
    }
  }

  console.log('✅ Message autorole envoyé');
});

// 🧩 Attribution des rôles avec réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();
    const roleId = roles[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.add(roleId);
    console.log(`✅ Rôle ajouté : ${roleId} à ${user.tag}`);
  } catch (error) {
    console.error("❌ Erreur ajout rôle :", error);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();
    const roleId = roles[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.remove(roleId);
    console.log(`🔁 Rôle retiré : ${roleId} à ${user.tag}`);
  } catch (error) {
    console.error("❌ Erreur suppression rôle :", error);
  }
});

// 🚀 Connexion
client.login(process.env.TOKEN);
