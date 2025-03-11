// 使用Deno兼容的OpenAI客户端
// @ts-ignore - 忽略所有Deno相关类型错误
import { OpenAI } from "npm:openai@4.20.1";
// @ts-ignore - 忽略代理相关类型错误
import HttpsProxyAgent from "npm:https-proxy-agent";

// 定义消息类型
export interface ChatCompletionMessageParam {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    // 从环境变量获取配置
    // @ts-ignore
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    // @ts-ignore
    const baseURL = Deno.env.get("OPENAI_BASE_URL");
    // @ts-ignore
    const httpProxy = Deno.env.get("HTTP_PROXY");
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY环境变量未设置");
    }
    
    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
      // @ts-ignore
      httpAgent: httpProxy ? new HttpsProxyAgent.HttpsProxyAgent(httpProxy) : undefined,
    });
  }

  async createChatCompletionWithPlainText(messages: ChatCompletionMessageParam[]) {
    try {
      const completion = await this.client.chat.completions.create({
        // @ts-ignore
        model: Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo",
        messages: messages
      });
      return completion.choices[0].message;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("AI服务请求失败: " + errorMessage);
    }
  }

  async createChatCompletionWithStream(messages: ChatCompletionMessageParam[]) {
    try {
      const completion = await this.client.chat.completions.create({
        // @ts-ignore
        model: Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo",
        messages: messages,
        stream: true
      });

      const content: string[] = [];
      for await (const chunk of completion) {
        if (chunk.choices[0]?.delta?.content) {
          console.log(chunk.choices[0].delta.content);
          content.push(chunk.choices[0].delta.content);
        }
      }
      return content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("AI服务请求失败: " + errorMessage);
    }
  }
}

export default OpenAIService; 