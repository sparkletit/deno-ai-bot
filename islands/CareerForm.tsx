import { useState } from "preact/hooks";

interface CareerFormData {
  age: string;
  location: string;
  education: string;
  skills: string;
  interest: string;
  work_experience: string;
}

interface SkillMatchRate {
  map_visualization?: string;
  china?: string;
  usa?: string;
  europe?: string;
  asia_pacific?: string;
}

interface CareerGoal {
  career?: string;
  salary_increase?: string;
}

interface CareerDevelopmentPath {
  current_stage?: string;
  "6_month_goal"?: CareerGoal;
  "1_2_year_goal"?: CareerGoal;
  "3_year_goal"?: CareerGoal;
}

interface LearningPath {
  core_skills?: string[];
  advanced_skills?: string[];
  leadership_skills?: string[];
}

interface StrengthsAndAreas {
  core_strengths?: string[];
  areas_for_improvement?: string[];
}

interface CareerAnalysisReport {
  recommended_position?: string;
  match_rate?: string;
  market_demand?: string;
  salary_potential?: string;
  strengths_and_areas_for_improvement?: StrengthsAndAreas;
}

interface NextStep {
  title: string;
  subtitle: string;
}

interface JsonResponseType {
  skill_match_rate?: SkillMatchRate;
  career_development_path?: CareerDevelopmentPath;
  recommended_learning_path?: LearningPath;
  career_analysis_report_summary?: CareerAnalysisReport;
  recommended_next_steps?: NextStep[];
}

export default function CareerForm() {
  const [formData, setFormData] = useState<CareerFormData>({
    age: "",
    location: "",
    education: "",
    skills: "",
    interest: "",
    work_experience: ""
  });
  
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState<JsonResponseType | null>(null);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/career/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: formData }),
      });

      const data = await response.json();
      
      if (data.status === "success" && data.reply) {
        setResponse(data.reply.content);
        
        try {
          // 尝试解析JSON响应
          const jsonData = JSON.parse(data.reply.content) as JsonResponseType;
          setJsonResponse(jsonData);
        } catch (error) {
          console.error("无法解析JSON响应:", error);
          setJsonResponse(null);
        }
      } else {
        throw new Error("获取职业建议失败");
      }
    } catch (error) {
      console.error("请求失败:", error);
      setResponse("很抱歉，请求失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-xl font-semibold mb-4">填写个人信息</h2>
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label htmlFor="age" class="block text-sm font-medium mb-1">年龄</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例如: 28"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" class="block text-sm font-medium mb-1">所在地区</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例如: 北京"
              required
            />
          </div>
          
          <div>
            <label htmlFor="education" class="block text-sm font-medium mb-1">教育背景</label>
            <input
              type="text"
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例如: 本科计算机科学"
              required
            />
          </div>
          
          <div>
            <label htmlFor="skills" class="block text-sm font-medium mb-1">技能</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="例如: JavaScript, React, Node.js"
              required
            />
          </div>
          
          <div>
            <label htmlFor="interest" class="block text-sm font-medium mb-1">兴趣爱好</label>
            <textarea
              id="interest"
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="例如: 人工智能, 数据分析, 用户体验设计"
              required
            />
          </div>
          
          <div>
            <label htmlFor="work_experience" class="block text-sm font-medium mb-1">工作经验</label>
            <textarea
              id="work_experience"
              name="work_experience"
              value={formData.work_experience}
              onChange={handleChange}
              class="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="例如: 3年前端开发经验, 1年项目管理经验"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? "分析中..." : "获取职业建议"}
          </button>
        </form>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-4">职业分析结果</h2>
        <div class="border border-gray-300 rounded-lg p-4 min-h-[500px] bg-gray-50 overflow-auto">
          {isLoading ? (
            <p class="text-gray-500">正在分析中，请稍候...</p>
          ) : jsonResponse ? (
            <div class="space-y-4">
              <div>
                <h3 class="font-bold text-lg">技能匹配率</h3>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div class="bg-blue-100 p-2 rounded">
                    <span class="font-medium">中国: </span>
                    {jsonResponse.skill_match_rate?.china}
                  </div>
                  <div class="bg-blue-100 p-2 rounded">
                    <span class="font-medium">美国: </span>
                    {jsonResponse.skill_match_rate?.usa}
                  </div>
                  <div class="bg-blue-100 p-2 rounded">
                    <span class="font-medium">欧洲: </span>
                    {jsonResponse.skill_match_rate?.europe}
                  </div>
                  <div class="bg-blue-100 p-2 rounded">
                    <span class="font-medium">亚太: </span>
                    {jsonResponse.skill_match_rate?.asia_pacific}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="font-bold text-lg">职业发展路径</h3>
                <div class="mt-2 space-y-2">
                  <div class="bg-green-100 p-2 rounded">
                    <span class="font-medium">当前阶段: </span>
                    {jsonResponse.career_development_path?.current_stage}
                  </div>
                  <div class="bg-green-100 p-2 rounded">
                    <span class="font-medium">6个月目标: </span>
                    {jsonResponse.career_development_path?.["6_month_goal"]?.career} 
                    (薪资增长: {jsonResponse.career_development_path?.["6_month_goal"]?.salary_increase})
                  </div>
                  <div class="bg-green-100 p-2 rounded">
                    <span class="font-medium">1-2年目标: </span>
                    {jsonResponse.career_development_path?.["1_2_year_goal"]?.career}
                    (薪资增长: {jsonResponse.career_development_path?.["1_2_year_goal"]?.salary_increase})
                  </div>
                  <div class="bg-green-100 p-2 rounded">
                    <span class="font-medium">3年目标: </span>
                    {jsonResponse.career_development_path?.["3_year_goal"]?.career}
                    (薪资增长: {jsonResponse.career_development_path?.["3_year_goal"]?.salary_increase})
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="font-bold text-lg">推荐学习路径</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <div class="bg-yellow-100 p-2 rounded">
                    <h4 class="font-medium">核心技能</h4>
                    <ul class="list-disc pl-5">
                      {jsonResponse.recommended_learning_path?.core_skills?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div class="bg-yellow-100 p-2 rounded">
                    <h4 class="font-medium">进阶技能</h4>
                    <ul class="list-disc pl-5">
                      {jsonResponse.recommended_learning_path?.advanced_skills?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div class="bg-yellow-100 p-2 rounded">
                    <h4 class="font-medium">领导力技能</h4>
                    <ul class="list-disc pl-5">
                      {jsonResponse.recommended_learning_path?.leadership_skills?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : response ? (
            <pre class="whitespace-pre-wrap">{response}</pre>
          ) : (
            <p class="text-gray-500">填写左侧表单并提交，获取AI职业分析</p>
          )}
        </div>
      </div>
    </div>
  );
} 