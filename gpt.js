const { Configuration, OpenAIApi } = require('openai')
const config = require('./config/config')
const HttpsProxyAgent = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');

// 配置 OpenAI API 密钥和模型名称
let configuration = new Configuration({
    apiKey: config.apikey,
});

let openai = new OpenAIApi(configuration);
if (config.proxy.enable) {
    const { proxy: { baseURL, host, port, protocol } } = config
    let agent;
    switch (protocol) {
        case 'http', 'https':
            agent = new HttpsProxyAgent(`${protocol}://${host}:${port}`)
            break;
        case 'socks':
            agent = new SocksProxyAgent(`${protocol}://${host}:${port}`)
            break;
        default:
            console.error(`不支持的协议:${protocol}`)
            break;
    }
    openai = new OpenAIApi(configuration, baseURL, axios.create({
        proxy: false,
        httpAgent: agent,
        httpsAgent: agent,
    }))
}
const conMap = new Map()

// 使用 OpenAI GPT 模型生成回复
// 使用 OpenAI GPT 模型生成回复
async function getChatGPTResponse(message, contack) {
    let his = conMap.get(contack.id) || []
    try {
        let currMsg = { role: "user", content: message }
        his.push(currMsg);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: his,
            n: 1,
            max_tokens: 2048,
            temperature: 1,
        })
        let res = response.data.choices[0].message
        res.content = res.content.trim()
        his.push(res)
        const maxHisCount = config?.historyCount * 2 || 6;
        if (his.length > maxHisCount) {
            his = his.slice(-maxHisCount)
        }
        console.log(`${contack.name()}:${message}\n${res.role}:${res.content}`);
        conMap.set(contack.id, his)
        return res.content;
    } catch (error) {
        console.error('OpenAI GPT 模型生成回复失败：' + error)
        conMap.set(contack.id, [])
        return '很抱歉，我现在无法回复您的消息。'
    }
}

module.exports = { getChatGPTResponse }

if (require.main === module) {
    getChatGPTResponse("哈哈哈", { id: "user", name: () => 'sx' }).then(console)
}
