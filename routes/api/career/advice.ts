import { Handlers } from "$fresh/server.ts";
import OpenAIService from "../../../lib/openai.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      console.log("收到请求体:", JSON.stringify(body));
      
      const message = body.message;
      console.log("提取的message:", message, "类型:", typeof message);
      
      if (message === undefined || message === null) {
        throw new Error('请求中缺少message字段');
      }
      
      // 创建OpenAI服务实例
      const service = new OpenAIService();

      // 系统提示词，定义AI的角色和行为
      const systemPrompt = '你是个aijob分析师，可以根据用户的输入，来帮助分析用户的职业发展前景，推荐合适的工作，职业发展路径以及综合建议等。输入格式如下：\
      {  "age":   "location": ,  "education": ,  "skills": ,  "interest": ,  "work_experience": }返回结果包含：1.skill match rate（按照全球各地地图形式展示，并附上匹配百分比）\
      2.career decelopment path，职业发展路径包含curent stage，6-month goal career及salary涨幅，1-2year goal career及salary涨幅，\
      3year goal career及salary涨幅3.Recommended Learning Path，包含Core Skills，\
      列出三点，advanced skills 列出三点，leadership skills 列出三点4.职业分析报告summary，包含最推荐的职位是什么，职位的Match Rate，\
      职位的Market Demand，职位的Salary Potential；以及Strengths & Areas for Improvement，\
      包含Core Strengths，列出4点建议， Areas for Improvement列出4点建议5.Recommended Next Steps，列出4点建议，每一点包含标题和副标题\
      6.请按{"skill_match_rate":{"map_visualization":"xxx","china":"xxx","usa":"xxx","europe":"xxx","asia_pacific":"xxx"},"career_development_path":{"current_stage":"xxx","6_month_goal":{"career":"xxx","salary_increase":"xxx"},"1_2_year_goal":{"career":"xxx","salary_increase":"xxx"},"3_year_goal":{"career":"xxx","salary_increase":"xxx"}},"recommended_learning_path":{"core_skills":["xxx","xxx","xxx"],"advanced_skills":["xxx","xxx","xxx"],"leadership_skills":["xxx","xxx","xxx"]},"career_analysis_report_summary":{"recommended_position":"xxx","match_rate":"xxx","market_demand":"xxx","salary_potential":"xxx","strengths_and_areas_for_improvement":{"core_strengths":["xxx","xxx","xxx","xxx"],"areas_for_improvement":["xxx","xxx","xxx","xxx"]}},"recommended_next_steps":[{"title":"xxx","subtitle":"xxx"},{"title":"xxx","subtitle":"xxx"},{"title":"xxx","subtitle":"xxx"},{"title":"xxx","subtitle":"xxx"}]} 这样的格式模板返回json数据';
      
      // 构建用户提示
      let userPrompt = '';
      
      // 处理不同类型的message
      if (typeof message === 'string') {
        // 如果message是字符串，直接使用
        userPrompt = message;
        console.log("使用字符串message:", userPrompt);
      } else if (message && typeof message === 'object') {
        // 如果message是对象，转换为JSON字符串
        userPrompt = JSON.stringify(message);
        console.log("使用对象message:", userPrompt);
      } else {
        console.error("无效的message类型:", typeof message, "值:", message);
        throw new Error('无效的message格式，请提供字符串或对象');
      }

      // 调用OpenAI服务
      const aiResponse = await service.createChatCompletionWithPlainText([
        {
          role: "system",
          content: systemPrompt
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ]);

      // 返回响应
      return new Response(JSON.stringify({ 
        status: 'success',
        reply: aiResponse
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error('Career API Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify(
        { status: 'error', message: 'AI服务请求失败: ' + errorMessage }
      ), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
}; 