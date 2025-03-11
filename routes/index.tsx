import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>AI助手</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold text-center my-8">AI助手</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <a
            href="/career"
            class="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 class="text-2xl font-bold">职业发展建议</h2>
            <p class="mt-2 text-gray-600">
              获取个性化的职业发展建议，包括技能匹配率、职业发展路径和学习计划。
            </p>
          </a>
          
          <a
            href="#"
            class="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 class="text-2xl font-bold">更多功能</h2>
            <p class="mt-2 text-gray-600">
              敬请期待更多AI功能...
            </p>
          </a>
        </div>
        
        <footer class="mt-16 text-center text-gray-500 text-sm">
          <p>基于Deno和Fresh框架构建</p>
        </footer>
      </div>
    </>
  );
} 