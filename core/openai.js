const { Configuration, OpenAIApi } = require('openai')

// 配置 OpenAI API 密钥和模型名称
let configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

let openai = new OpenAIApi( configuration );

/**
 * 使用 OpenAI GPT 模型生成回复
 * @return {String} text
 */
async function getChatGPTResponse(message, contack) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a helpful assistant named 小回."},
        {"role": "user", "content": message },
      ],
      n: 1,
      max_tokens : 2048,
      temperature: 1,
    })
    let res = response.data.choices[0].message
    res.content = res.content.trim()
    console.log(`${contack.name()}:${message}\n${res.role}:${res.content}`);
    return res.content;
  } catch (error) {
    console.error('OpenAI GPT 模型生成回复失败：' + error)
    return '很抱歉，我现在无法回复您的消息。'
  }
}

module.exports = { getChatGPTResponse }