require('dotenv').config();
const express = require('express');
const app = express();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// 📌 IDs fixes
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const choixRolesChannelId = '1385943465321566289';
const membreRoleId = '1385627871023861820';

// 🎮 Rôles liés aux réactions
const roles = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Salon trash
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

  channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(console.error);
});

// 📜 Commande !reglement
client.on('messageCreate', async message => {
  if (message.content === '!reglement' && message.channel.id === reglementChannelId) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur')
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
        'Respecte les décisions du staff. En cas de souci, contacte un modérateur.'
      );

    const button = new ButtonBuilder()
      .setCustomId('reglement_accepte')
      .setLabel('Valider')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('☑️');

    const row = new ActionRowBuilder().addComponents(button);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ✅ Interaction du bouton règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'reglement_accepte') {
    const role = interaction.guild.roles.cache.get(membreRoleId);
    if (!role) {
      return interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: '✅ Bienvenue ! Tu as maintenant accès au serveur.', ephemeral: true });
    } catch (err) {
      console.error('Erreur en ajoutant le rôle :', err);
      await interaction.reply({ content: '❌ Impossible d’ajouter le rôle.', ephemeral: true });
    }
  }
});

// 🎭 Commande !autorole
client.on('messageCreate', async message => {
  if (message.content === '!autorole' && message.channel.id === choixRolesChannelId) {
    const msg = await message.channel.send({
      content: `**🎯 Choisis tes jeux préférés pour recevoir les notifs :**

🔫 **Valorant**  
💥 **Fortnite**  
🚀 **Rocket League**  
🎮 **Autres jeux**  
🔞 **Salon trash**

💡 *Tu peux proposer d'autres jeux dans le salon discussions !*`
    });

    for (const emoji of Object.keys(roles)) {
      await msg.react(emoji);
    }
  }
});

// ➕ Ajouter rôle à la réaction
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || !roles[reaction.emoji.name]) return;

  const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
  if (member) member.roles.add(roles[reaction.emoji.name]).catch(console.error);
});

// ➖ Retirer rôle à la réaction
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot || !roles[reaction.emoji.name]) return;

  const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
  if (member) member.roles.remove(roles[reaction.emoji.name]).catch(console.error);
});

// 🔐 Connexion
client.login(process.env.TOKEN);
