const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// ✅ CONFIGURATION
const REGLEMENT_CHANNEL_ID = '1385409088824938652';
const MEMBRE_ROLE_ID = '1385627871023861820';
const EMOJI_ID = '1387148694230667448'; // <:apple_success:1387148694230667448>

// 🚀 Quand le bot est prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 📥 Commande !reglement
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!reglement') {
    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur Discord')
      .setColor(0x3498db)
      .setDescription(`
**🤝 Respect et Bienveillance**  
Le respect entre membres est obligatoire. Pas d'insulte, harcèlement ou propos haineux. On peut rigoler, mais pas de toxicité.

**🗣️ Comportement et Langage**  
Pas de spam, propos vulgaires ou langage choquant. Reste poli même en désaccord.

**📌 Sujets sensibles**  
Évite les discussions politiques/religieuses/sensibles. Pas de contenu NSFW ou gore, même en privé sans consentement.

**📢 Publicité et Partages**  
Pas de pub sans autorisation. Les liens doivent être sûrs (pas de phishing ou virus).

**🛠️ Utilisation des salons**  
Respecte les thèmes de chaque salon. Ne ping pas pour rien.

**👑 Staff et Sanctions**  
Le staff est là pour garder la bonne ambiance. Le non-respect du règlement = sanction.
      `);

    const bouton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accepter_reglement')
        .setLabel('✅ J’ai lu et j’accepte le règlement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji({ name: 'apple_success', id: EMOJI_ID })
    );

    try {
      const channel = await client.channels.fetch(REGLEMENT_CHANNEL_ID);
      if (!channel) return console.error("❌ Salon règlement introuvable.");
      await channel.send({ embeds: [embed], components: [bouton] });
      console.log("✅ Message de règlement envoyé !");
    } catch (err) {
      console.error("❌ Erreur envoi règlement :", err);
    }
  }
});

// ✅ Attribution du rôle quand on clique sur le bouton
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'accepter_reglement') {
    const role = interaction.guild.roles.cache.get(MEMBRE_ROLE_ID);
    if (!role) {
      return interaction.reply({ content: "❌ Rôle membre introuvable.", ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: "✅ Tu as accepté le règlement. Bienvenue !", ephemeral: true });
    } catch (err) {
      console.error("❌ Erreur attribution rôle :", err);
      await interaction.reply({ content: "❌ Erreur lors de l’ajout du rôle.", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
