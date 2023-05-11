require('dotenv').config(); //process.env.*

const { WechatyBuilder } = require('wechaty')
const moment = require('moment');
const onMessage = require('./core/onMessage');

let interval;

async function loginWechaty() {
    const bot = WechatyBuilder.build()

    bot.on('scan', async (qrcodeValue, status) => {
        if (status === 2) console.log('on scan')
    })

    bot.on('login', async user => {
        console.log(`登录成功，用户名：${user}`)
        setupHeartbeat( user, bot )
    })

    bot.on('logout', async user => {
        console.log(`用户${user}已退出登录`)
        process.exit(0)
    })

    bot.on('message', async message => {
        await onMessage( message, bot )
    })

    bot.on('error', async (err) => {
        console.error(err);
    })

    await bot.start()
}

async function setupHeartbeat( user, bot ){
  const heart = process.env.HEART_BEAT;
  if ( heart.enable ) {
    const startTime = moment()
    const { interval: timeInterval, contactName } = heart;
    if (interval) clearInterval(interval);
    interval = setInterval(async () => {
      const contact = await bot.Contact.find({ name: contactName });
      if(contact) {
        await contact.say(`我还活着！已经活了 ${moment().diff(startTime, 'minutes')}分钟 ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
      }
    }, timeInterval * 1000);
  }
}

loginWechaty()
