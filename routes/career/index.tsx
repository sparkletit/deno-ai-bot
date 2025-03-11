import { Head } from "$fresh/runtime.ts";
import CareerForm from "../../islands/CareerForm.tsx";

export default function Career() {
  return (
    <>
      <Head>
        <title>职业发展建议 - AI助手</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <div class="mb-8">
          <a href="/" class="text-blue-500 hover:underline">
            &larr; 返回首页
          </a>
          <h1 class="text-3xl font-bold mt-4 mb-6">职业发展建议</h1>
          <p class="mb-4">
            填写下面的表单，AI将为您分析职业发展前景，推荐合适的工作和职业发展路径。
          </p>
        </div>
        
        <CareerForm />
      </div>
    </>
  );
} 