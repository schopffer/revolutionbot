// 🌐 Serveur Express pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Serveur web actif sur Render'));

// 📦 Chargement des modules
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

// 🤖 Initialisation du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔢 IDs du serveur
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const choixRoleChannelId = '1385943465321566289';
const membreRoleId = '1385627871023861820';

// 🎭 Rôles par emoji
const roles = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Trash
};

// 🔓 Connexion du bot
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  try {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`Bienvenue ${member.user.username} !`)
      .setColor(0x00AE86)
      .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
      .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.error("❌ Erreur message de bienvenue :", err);
  }
});

// 💬 Commandes texte (!autorole et !reglement)
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 📌 Commande !autorole
  if (message.content === '!autorole' && message.channel.id === choixRoleChannelId) {
    const embed = new EmbedBuilder()
      .setTitle("🎯 Choisis tes jeux préférés !")
      .setDescription(`
Clique sur les réactions pour obtenir un rôle :

🔫 Valorant  
💥 Fortnite  
🚀 Rocket League  
🎮 Autres jeux  
🔞 Salon trash

💡 Tu peux proposer d'autres jeux dans le salon discussions.
      `)
      .setColor(0x5865F2);

    try {
      const msg = await message.channel.send({ embeds: [embed] });
      for (const emoji of Object.keys(roles)) {
        await msg.react(emoji);
      }
    } catch (err) {
      console.error("❌ Erreur envoi autorole :", err);
    }
  }

  // 📌 Commande !reglement
  if (message.content === '!reglement' && message.channel.id === reglementChannelId) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur')
      .setColor(0x3498db)
      .setDescription(`
**🤝 Respect et Bienveillance**  
Le respect entre membres est obligatoire.  
Pas d’insultes, harcèlement ou propos haineux.

**🗣️ Comportement et Langage**  
Utilise un langage approprié, pas de spam ou pub.  
Reste poli même en cas de désaccord.

**📌 Sujets sensibles**  
Évite politique, religion, contenu NSFW.

**📢 Publicité et Partages**  
Pas de pub sans autorisation. Liens non nuisibles.

**🛠️ Utilisation des salons**  
Respecte les thèmes, ne spam pas les pings.

**👑 Staff et Sanctions**  
Respecte les décisions du staff. Contacte un modo en cas de souci.
      `);

    const bouton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accepte_reglement')
        .setLabel('Valider le règlement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('☑️')
    );

    try {
      await message.channel.send({ embeds: [embed], components: [bouton] });
    } catch (err) {
      console.error("❌ Erreur envoi règlement :", err);
    }
  }
});

// 🖱️ Gestion du bouton règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() || interaction.customId !== 'accepte_reglement') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(membreRoleId);
    await interaction.reply({
      content: `✅ Règlement accepté ! Rôle 💎 Membre attribué à <@${member.id}>.`,
      ephemeral: true
    });
  } catch (err) {
    console.error("❌ Erreur attribution rôle règlement :", err);
    await interaction.reply({
      content: "❌ Une erreur est survenue lors de l'ajout du rôle.",
      ephemeral: true
    });
  }
});

// 🎭 Gestion des rôles via réactions
async function handleReaction(reaction, user, addRole = true) {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (reaction.message.channelId !== choixRoleChannelId) return;

    const roleId = roles[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (addRole) {
      await member.roles.add(roleId);
      console.log(`✅ Rôle ajouté à ${user.tag}`);
    } else {
      await member.roles.remove(roleId);
      console.log(`❌ Rôle retiré à ${user.tag}`);
    }
  } catch (err) {
    console.error("❌ Erreur gestion rôle par réaction :", err);
  }
}

client.on('messageReactionAdd', async (reaction, user) => {
  await handleReaction(reaction, user, true);
});

client.on('messageReactionRemove', async (reaction, user) => {
  await handleReaction(reaction, user, false);
});

// 🚀 Connexion à Discord
client.login(process.env.TOKEN);
