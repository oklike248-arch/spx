
const TelegramBot = require('node-telegram-bot-api');
const { Order } = require('./db');
const { trackSPX } = require('./tracker');
const { push } = require('./realtime');
require('./web');
const bot = new TelegramBot(process.env.BOT_TOKEN,{polling:true});

bot.on('message',async msg=>{
  if(!msg.text) return;
  const code = msg.text.toUpperCase();
  if(!code.startsWith('SPX')) return;
  const d = await trackSPX(code);
  if(!d) return bot.sendMessage(msg.chat.id,'❌ Không tìm thấy');
  await Order.findOneAndUpdate(
    {code,userId:msg.from.id},
    {code,userId:msg.from.id,chatId:msg.chat.id,carrier:'SPX',
     status:d.status,lastMsg:d.timeline[0]?.message,timeline:d.timeline},
    {upsert:true}
  );
  bot.sendMessage(msg.chat.id,`📦 ${code}
🚚 ${d.status}`,{
    reply_markup:{inline_keyboard:[
      [{text:'🔔 Bật/Tắt thông báo',callback_data:`toggle_${code}`}],
      [{text:'📍 Timeline',callback_data:`time_${code}`}]
    ]}
  });
});

bot.on('callback_query',async q=>{
  const [act,code]=q.data.split('_');
  const o = await Order.findOne({code,userId:q.from.id});
  if(!o) return;
  if(act==='toggle'){ o.notify=!o.notify; await o.save(); }
  if(act==='time'){
    bot.sendMessage(q.message.chat.id,o.timeline.map(i=>`• ${i.time} – ${i.message}`).join('\n'));
  }
});

setInterval(async()=>{
  const orders = await Order.find({notify:true});
  for(const o of orders){
    const d = await trackSPX(o.code);
    if(d && d.timeline[0]?.message!==o.lastMsg){
      bot.sendMessage(o.chatId,`🔔 ${o.code}\n${d.timeline[0].message}`);
      o.lastMsg=d.timeline[0].message;
      o.status=d.status;
      o.timeline=d.timeline;
      await o.save();
      push(o);
    }
  }
},900000);
