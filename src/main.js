import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openai } from './openai.js';

console.log(config.get('TEST_ENV'));

const INITIAL_SESSION = {
  messages: [],
};
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Wait for your voice or text message!)');
});

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Wait for your voice or text message!)');
});
// bot.on(message('text'), async (ctx) => {
//   await ctx.reply(JSON.stringify(ctx.message, null, 2)); // Work with TEXT
// });

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION; // ??= keep working when session = undefined
  try {
    await ctx.reply(code('Message received. Wait response from server!')); //loading
    // Work with VOICE
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);

    const userId = String(ctx.message.from.id); // When there are many users in chat, bot can discriminate users
    const oggPath = await ogg.create(link.href, userId);
    // console.log(oggPath);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);

    await ctx.reply(code(`Your request: ${text}`));

    ctx.session.messages.push({ role: openai.roles.USER, content: text });

    const response = await openai.chat(ctx.session.messages); // access to chat

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, //save context of chat
      content: response.content,
    });

    await ctx.reply(response.content);
    // await ctx.reply(JSON.stringify(link, null, 2));
  } catch (e) {
    console.log('error', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION; // ??= keep working when session = undefined
  try {
    await ctx.reply(code('Message received. Wait response from server!')); //loading

    const text = await openai.transcription();

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });

    const response = await openai.chat(ctx.session.messages); // access to chat

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, //save context of chat
      content: response.content,
    });

    await ctx.reply(response.content);
    // await ctx.reply(JSON.stringify(link, null, 2));
  } catch (e) {
    console.log('error', e.message);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
