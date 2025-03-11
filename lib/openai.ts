// 使用Deno兼容的OpenAI客户端
// @ts-ignore - 忽略所有Deno相关类型错误
import { OpenAI } from "npm:openai@4.20.1";

// 定义消息类型
export interface ChatCompletionMessageParam {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}

class OpenAIService {
  private client: OpenAI;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    // 从环境变量获取配置
    // @ts-ignore
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    // @ts-ignore
    const baseURL = Deno.env.get("OPENAI_BASE_URL");
    // @ts-ignore
    const httpProxy = Deno.env.get("HTTP_PROXY");
    // @ts-ignore
    const timeoutStr = Deno.env.get("API_TIMEOUT");
    // @ts-ignore
    const maxRetriesStr = Deno.env.get("API_MAX_RETRIES");
    
    // 设置默认值
    this.timeout = timeoutStr ? parseInt(timeoutStr) : 60000;
    this.maxRetries = maxRetriesStr ? parseInt(maxRetriesStr) : 3;
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY环境变量未设置");
    }
    
    console.log("初始化OpenAI客户端...");
    console.log(`API基础URL: ${baseURL || "默认"}`);
    console.log(`代理设置: ${httpProxy || "未使用代理"}`);
    console.log(`超时设置: ${this.timeout}ms`);
    console.log(`最大重试次数: ${this.maxRetries}`);
    
    // 设置代理
    let fetchImplementation = fetch;
    
    if (httpProxy) {
      try {
        console.log(`尝试设置代理: ${httpProxy}`);
        
        // 直接设置环境变量，这样Deno的fetch会自动使用代理
        // @ts-ignore
        Deno.env.set("HTTP_PROXY", httpProxy);
        // @ts-ignore
        Deno.env.set("HTTPS_PROXY", httpProxy);
        
        console.log("环境变量代理设置完成");
        
        // 创建一个自定义的fetch函数，用于记录请求信息
        fetchImplementation = async (url: RequestInfo | URL, init?: RequestInit) => {
          console.log(`发送请求到: ${url.toString()}`);
          console.log(`使用环境变量代理: ${httpProxy}`);
          
          try {
            const response = await fetch(url, init);
            console.log(`请求成功，状态码: ${response.status}`);
            return response;
          } catch (error) {
            console.error(`请求失败: ${error.message}`);
            throw error;
          }
        };
      } catch (error) {
        console.error(`设置代理失败: ${error.message}`);
      }
    }
    
    // 配置OpenAI客户端
    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      fetch: fetchImplementation
    });
  }

  // 添加重试函数
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`尝试请求 (${attempt}/${this.maxRetries})...`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`尝试 ${attempt}/${this.maxRetries} 失败: ${error.message}`);
        
        // 如果不是最后一次尝试，则等待后重试
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  async createChatCompletionWithPlainText(messages: ChatCompletionMessageParam[]) {
    try {
      console.log("开始请求AI服务...");
      // @ts-ignore
      console.log(`请求模型: ${Deno.env.get("OPENAI_MODEL") || "grok-2-latest"}`);
      const startTime = Date.now();
      
      // 真实API调用
      // @ts-ignore - 忽略类型错误
      const completion = await this.withRetry(() => this.client.chat.completions.create({
        // @ts-ignore
        model: Deno.env.get("OPENAI_MODEL") || "grok-2-latest",
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      }));
      
      const endTime = Date.now();
      console.log(`AI服务响应时间: ${endTime - startTime}ms`);
      
      // @ts-ignore - 忽略类型错误
      return completion.choices[0].message;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("AI服务请求失败: " + errorMessage);
    }
  }

  async createChatCompletionWithStream(messages: ChatCompletionMessageParam[]) {
    try {
      console.log("开始流式请求AI服务...");
      const startTime = Date.now();
      
      // 真实API调用
      // @ts-ignore - 忽略类型错误
      const completion = await this.withRetry(() => this.client.chat.completions.create({
        // @ts-ignore
        model: Deno.env.get("OPENAI_MODEL") || "grok-2-latest",
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      }));

      const content: string[] = [];
      // @ts-ignore - 忽略类型错误
      for await (const chunk of completion) {
        if (chunk.choices[0]?.delta?.content) {
          content.push(chunk.choices[0].delta.content);
        }
      }
      
      const endTime = Date.now();
      console.log(`AI服务流式响应时间: ${endTime - startTime}ms`);
      
      return content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("AI服务请求失败: " + errorMessage);
    }
  }
}

export default OpenAIService; 