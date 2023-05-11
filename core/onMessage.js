const { MessageImpl } = require("wechaty/impls");
const { getChatGPTResponse } = require("./openai");
const $account = require("./account");

/**
 * 
 * @param {MessageImpl} message 
 * @param {*} bot 
 * @returns 
 */
async function onMessage( message, bot ){
    if (message.self()) return
    if ( message.room() && await message.mentionSelf() ){
        console.log("收到@我的消息")

        const from = await message.talker()
        const room = await message.room()
        const text = await message.mentionText()

        //检查tokens
        const user = ( await $account.findOrCreate( from.name(), 2000 ) ).toJSON()
        if( user.tokens < text.length ){
          return await room?.say('您的体验额度已用完，请关注公众号【Half工坊】继续私密使用！',from)
        }
        
        const response = await getChatGPTResponse(text, message.talker())
        
        await $account.change( user.id, -( text.length + response.length ) )
        await room.say(response, from)
    }
    else{
      console.log("收到私聊")
      return 
      // const talker = message.talker()
      // if (talker.type() !== bot.Contact.Type.Individual) {
      //   console.log(`这不是来自个人的消息的，这是来自${talker.type()}`);
      //   return;
      // }
      // const response = await getChatGPTResponse(message.text(), talker)
      // await talker.say(response)
    }
}

module.exports = onMessage