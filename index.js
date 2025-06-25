// 🌐 Express pour hébergement Render
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Serveur web actif sur le port ${PORT}`));

// 📆 Modules Discord.js
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes,
  Events,
  PermissionsBitField
} = require('discord.js');

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔢 IDs personnalisés (mets les tiens ici ou via .env)
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const welcomeChannelId = '1385999517983440967'; // à adapter
const choixRoleChannelId = '1385943465321566289';
const membreRoleId = '1385627871023861820';
const logChannelId = '1385651948094623865';

// 🎮 Rôles par emoji
const roles = {
  '🔫': '1385980913728487455',
  '💥': '1386063811907162183',
  '🚀': '1385983179034202112',
  '🎮': '1385982774619672646',
  '🔞': '1386695919675769005'
};

// 📋 Déclaration des commandes
const commands = [
  new SlashCommandBuilder().setName('autorole').setDescription('Afficher les rôles disponibles'),
  new SlashCommandBuilder().setName('reglement').setDescription('Afficher le règlement du serveur'),
  new SlashCommandBuilder().setName('help').setDescription('Afficher la liste des commandes disponibles'),
  new SlashCommandBuilder().setName('ban').setDescription('Bannir un membre').addUserOption(option =>
    option.setName('membre').setDescription('Membre à bannir').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('Expulser un membre').addUserOption(option =>
    option.setName('membre').setDescription('Membre à expulser').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Rendre un membre muet').addUserOption(option =>
    option.setName('membre').setDescription('Membre à rendre muet').setRequired(true)),
  new SlashCommandBuilder().setName('unban').setDescription('Débannir un membre').addStringOption(option =>
    option.setName('userid').setDescription("ID du membre à débannir").setRequired(true)),
  new SlashCommandBuilder().setName('blague').setDescription('Raconte une blague pour rigoler 😄')
].map(cmd => cmd.toJSON());

// 🔄 Fonction de déploiement des commandes
async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('Déploiement des commandes...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Commandes déployées !');
  } catch (error) {
    console.error('Erreur déploiement commandes :', error);
  }
}

// 👋 Message de bienvenue avec gif aléatoire
client.on('guildMemberAdd', async (member) => {
  const gifs = [
    'https://media1.giphy.com/media/q8ld8Sk7WWyY0/giphy.gif',
    'https://media1.giphy.com/media/9az09tlYyYNfq/giphy.gif',
    'https://media1.giphy.com/media/PoK3zuKMTYqNUFFbaG/giphy.gif',
    'https://media1.giphy.com/media/A8v23NdA9fGZW/giphy.gif',
    'https://media1.giphy.com/media/13Uqp5IGFpmDle/giphy.gif'
  ];
  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage(randomGif)
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });
  await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
});

// 📦 Slash + bouton handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commandName === 'autorole') {
      if (interaction.channel.id !== choixRoleChannelId) {
        return interaction.reply({ content: '❌ Utilise cette commande dans le salon autorole.', ephemeral: true });
      }
      await interaction.reply({ content: '📩 Menu autorole envoyé dans ce salon.', ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('🎯 Choisis tes jeux préférés !')
        .setColor(0x3498db)
        .setDescription(`
Réagis avec un émoji pour recevoir un rôle :

> 🔫 ・ **Valorant**
> 💥 ・ **Fortnite**
> 🚀 ・ **Rocket League**
> 🎮 ・ **Autres jeux**
> 🔞 ・ **Salon Trash**

💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.
        `)
        .setFooter({ text: 'Clique sur un émoji ci-dessous pour recevoir ou retirer un rôle.' });
      const msg = await interaction.channel.send({ embeds: [embed] });
      for (const emoji of Object.keys(roles)) await msg.react(emoji);
    }

    if (commandName === 'reglement') {
      await interaction.reply({ content: '📩 Règlement envoyé dans ce salon.', ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('📜 Règlement du Serveur')
        .setColor(0x3498db)
        .setDescription(`
**🤝 Respect** : soyez bienveillant.
**🗣️ Langage** : pas de spam, pub, propos haineux.
**📌 Sujets sensibles** : pas de politique, religion, NSFW.
**📢 Publicité** : interdite sans accord.
**🛠️ Utilisation des salons** : respectez les thèmes.
**👑 Staff** : respect des décisions.
        `);
      const bouton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accepte_reglement')
          .setLabel('Valider le règlement')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('☑️')
      );
      await interaction.channel.send({ embeds: [embed], components: [bouton] });
    }

    if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📚 Commandes disponibles')
        .setColor(0x00bfff)
        .setDescription(`
• /autorole : afficher les rôles disponibles
• /reglement : afficher le règlement
• /ban : bannir un membre (admin seulement)
• /kick : expulser un membre (admin seulement)
• /mute : rendre un membre muet (admin seulement)
• /unban : débannir un membre (admin seulement)
• /blague : une blague aléatoire pour rigoler 😄
        `);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === 'ban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de bannir.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
      await member.ban();
      await interaction.reply({ content: `🔨 <@${user.id}> a été banni.` });
    }

    if (commandName === 'kick') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission d’expulser.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
      await member.kick();
      await interaction.reply({ content: `🦶 <@${user.id}> a été expulsé.` });
    }

    if (commandName === 'mute') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de mute.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
      await member.timeout(24 * 60 * 60 * 1000, 'Mute par commande modérateur');
      await interaction.reply({ content: `🔇 <@${user.id}> a été rendu muet pendant 24h.` });
    }

    if (commandName === 'unban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de débannir.', ephemeral: true });
      }
      const userId = interaction.options.getString('userid');
      try {
        await interaction.guild.members.unban(userId);
        await interaction.reply({ content: `🔓 L'utilisateur avec l'ID \`${userId}\` a été débanni.` });
      } catch (error) {
        console.error('❌ Erreur unban :', error);
        await interaction.reply({ content: `❌ Impossible de débannir l'utilisateur avec l'ID \`${userId}\`.` });
      }
    }

    if (commandName === 'blague') {
      if (!interaction.member.roles.cache.has(membreRoleId)) {
        return interaction.reply({ content: '❌ Tu dois avoir le rôle membre pour utiliser cette commande.', ephemeral: true });
      }
      const blagues = [
        "Pourquoi les canards ont-ils autant de plumes ? Pour couvrir leur derrière !",
        "Quel est le comble pour un électricien ? De ne pas être au courant.",
        "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau.",
        "Quelle est la boisson préférée des informaticiens ? Le Java.",
        "Pourquoi les squelettes ne se battent jamais entre eux ? Ils n'ont pas le cran.",
        "Quel est le sport le plus fruité ? La boxe, car on prend des pêches.",
        "Pourquoi les poissons détestent l'ordinateur ? À cause de la souris.",
        "Comment appelle-t-on un chat qui a perdu ses pattes ? On ne l'appelle pas, on va le chercher.",
        "Quel est le comble pour un jardinier ? De raconter des salades.",
        "Pourquoi les vaches ferment-elles les yeux quand elles dorment ? Parce qu'elles ne peuvent pas les laisser ouverts.",
        "Pourquoi les mouettes volent au bord de la mer ? Parce que si elles volaient au bord de l’eau douce, ce seraient des douettes.",
        "Pourquoi les abeilles vont à l’école ? Pour avoir le B.A.-ba.",
        "Qu'est-ce qu'un citron avec une cape ? Un citron pressé.",
        "Pourquoi les araignées squattent les coins ? Parce qu'elles y tissent leur toile.",
        "Quel est le fruit préféré du militaire ? La grenade.",
        "Pourquoi les vampires aiment les gâteaux ? Parce qu’ils ont la dalle.",
        "Pourquoi les bananes ne se disputent jamais ? Parce qu’elles ont la banane.",
        "Pourquoi les fantômes n’aiment pas la pluie ? Parce qu’elle les rend transparents.",
        "Qu’est-ce qu’un chat sur un ordinateur ? Un fichier.",
        "Pourquoi les grenouilles sont-elles mauvaises en maths ? Parce qu’elles font des bonds.",
        "Pourquoi les zombies ne mangent jamais de clowns ? Parce qu’ils ont un goût drôle.",
        "Pourquoi les arbres ne mentent jamais ? Parce qu’ils ont des racines.",
        "Quel est le comble pour un boulanger ? De ne pas être dans son pain.",
        "Pourquoi les escargots sont lents ? Parce qu’ils traînent leur maison.",
        "Pourquoi les pizzas n’aiment pas les maths ? Parce qu’elles n’aiment pas être partagées.",
        "Quel est le super-héros préféré des électriciens ? Voltman.",
        "Pourquoi les robots ne pleurent-ils jamais ? Parce qu’ils sont programmés pour être forts.",
        "Quel est l’animal le plus connecté ? Le rat-pporteur.",
        "Pourquoi les chats détestent l’eau ? Parce qu’ils préfèrent le web.",
        "Pourquoi les avions volent ? Parce qu’ils ont un plan.",
        "Pourquoi les boutons aiment les pulls ? Parce qu’ils s’y attachent.",
        "Pourquoi les musiciens voyagent beaucoup ? Parce qu’ils ont le sens du rythme.",
        "Pourquoi les mouches volent ? Parce qu’aller marcher c’est fatigant.",
        "Pourquoi les hiboux ne font jamais de bruit ? Parce qu’ils préfèrent les chuchotements.",
        "Pourquoi les pommes tombent toujours ? Parce qu’elles en ont marre d’être en haut.",
        "Pourquoi les chats ne révisent jamais ? Parce qu’ils ont neuf vies.",
        "Pourquoi les carottes sont-elles orange ? Parce qu’elles n’aiment pas le vert.",
        "Pourquoi les poules traversent la route ? Pour aller sur le Discord !",
        "Pourquoi les électriciens aiment les blagues ? Parce qu'elles sont chargées.",
        "Pourquoi les fantômes vont au théâtre ? Pour les pièces hantées.",
        "Quel est le comble pour un électricien ? De ne pas être branché.",
        "Pourquoi les informaticiens n’aiment pas sortir ? Parce qu’ils préfèrent rester en ligne.",
        "Pourquoi les voleurs n’aiment pas le soleil ? Parce qu’ils ont peur des lumières.",
        "Pourquoi les plongeurs sont bons en apnée ? Parce qu’ils respirent le silence.",
        "Pourquoi les poulets détestent les ronds-points ? Parce qu’ils ne savent jamais comment en sortir.",
        "Pourquoi les papillons ne parlent pas ? Parce qu’ils sont dans leur cocon.",
        "Pourquoi les chaises sont toujours fatiguées ? Parce qu’elles sont toujours assises.",
        "Pourquoi les frites ne vont jamais à la plage ? Parce qu’elles ont peur de l’huile solaire."
      ];
      const blague = blagues[Math.floor(Math.random() * blagues.length)];
      await interaction.reply({ content: `😂 ${blague}`, ephemeral: false });
    }
  }

  if (interaction.isButton() && interaction.customId === 'accepte_reglement') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(membreRoleId);
    await interaction.reply({ content: '✅ Règlement accepté. Rôle attribué.', ephemeral: true });
  }
});

// 🎭 Gestion des rôles par réactions
async function handleReaction(reaction, user, add = true) {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;
    if (reaction.message.channelId !== choixRoleChannelId) return;
    const roleId = roles[reaction.emoji.name];
    if (!roleId) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    if (add) await member.roles.add(roleId);
    else await member.roles.remove(roleId);
  } catch (err) {
    console.error("❌ Erreur rôle via réaction :", err);
  }
}

client.on('messageReactionAdd', (reaction, user) => handleReaction(reaction, user, true));
client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, false));

// 📜 Logs type Carl-bot améliorés en embeds
client.on('guildBanAdd', async (ban) => {
  const channel = ban.guild.channels.cache.get(logChannelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
    .setTitle('🔨 Membre banni')
    .setDescription(`L'utilisateur ${ban.user} a été banni.`)
    .addFields({ name: 'ID', value: `\`${ban.user.id}\`` })
    .setTimestamp()
    .setColor('Red');
  await channel.send({ embeds: [embed] });
});

client.on('guildBanRemove', async (ban) => {
  const channel = ban.guild.channels.cache.get(logChannelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
    .setTitle('♻️ Membre débanni')
    .setDescription(`L'utilisateur ${ban.user} a été débanni.`)
    .addFields({ name: 'ID', value: `\`${ban.user.id}\`` })
    .setTimestamp()
    .setColor('Green');
  await channel.send({ embeds: [embed] });
});

client.on('messageDelete', async message => {
  const channel = message.guild?.channels.cache.get(logChannelId);
  if (!channel || !message.content || message.author?.bot) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    .setTitle('🗑️ Message supprimé')
    .setDescription(message.content.length > 1024 ? message.content.slice(0, 1021) + '...' : message.content)
    .addFields(
      { name: 'Auteur', value: `<@${message.author.id}> (\`${message.author.id}\`)`, inline: true },
      { name: 'Salon', value: `<#${message.channel.id}>`, inline: true },
      { name: 'Message ID', value: `\`${message.id}\``, inline: true }
    )
    .setTimestamp()
    .setColor('DarkRed');
  await channel.send({ embeds: [embed] });
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
  const channel = oldMsg.guild?.channels.cache.get(logChannelId);
  if (!channel || oldMsg.partial || newMsg.partial || oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: oldMsg.author.tag, iconURL: oldMsg.author.displayAvatarURL() })
    .setTitle('✏️ Message édité')
    .addFields(
      { name: 'Auteur', value: `<@${oldMsg.author.id}> (\`${oldMsg.author.id}\`)` },
      { name: 'Salon', value: `<#${oldMsg.channel.id}>` },
      { name: 'Avant', value: oldMsg.content.length > 1024 ? oldMsg.content.slice(0, 1021) + '...' : oldMsg.content },
      { name: 'Après', value: newMsg.content.length > 1024 ? newMsg.content.slice(0, 1021) + '...' : newMsg.content }
    )
    .setTimestamp()
    .setColor('Orange');
  await channel.send({ embeds: [embed] });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const channel = newMember.guild.channels.cache.get(logChannelId);
  if (!channel) return;

  if (oldMember.nickname !== newMember.nickname) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .setTitle('🪪 Pseudo modifié')
      .setDescription(`<@${newMember.id}> a changé de pseudo`)
      .addFields(
        { name: 'Ancien pseudo', value: oldMember.nickname || oldMember.user.username, inline: true },
        { name: 'Nouveau pseudo', value: newMember.nickname || newMember.user.username, inline: true }
      )
      .setTimestamp()
      .setColor('Orange');
    await channel.send({ embeds: [embed] });
  }

  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  if (addedRoles.size > 0) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .setTitle('➕ Rôles ajoutés')
      .setDescription(`<@${newMember.id}> a reçu les rôles suivants :`)
      .addFields(
        { name: 'Rôles', value: addedRoles.map(r => r.name).join(', ') }
      )
      .setTimestamp()
      .setColor('Green');
    await channel.send({ embeds: [embed] });
  }

  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
  if (removedRoles.size > 0) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .setTitle('➖ Rôles retirés')
      .setDescription(`<@${newMember.id}> a perdu les rôles suivants :`)
      .addFields(
        { name: 'Rôles', value: removedRoles.map(r => r.name).join(', ') }
      )
      .setTimestamp()
      .setColor('Red');
    await channel.send({ embeds: [embed] });
  }
});

// 🔐 Connexion
client.login(process.env.TOKEN);
