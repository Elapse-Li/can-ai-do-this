// 场景雷达的精选数据。
// star 数为 2026-11 抓取，仅作参考；GitHub 实时结果由页面另行搜索。
window.RADAR_DATA = {
  updated: "2026-11-12",
  categories: [
    {
      id: "office",
      label: "办公",
      hint: "周报 / 纪要 / 表格 / 邮件 / PPT",
      keywords: ["周报", "会议纪要", "表格分析", "邮件", "PPT"],
      githubQuery: "AI office automation"
    },
    {
      id: "teacher",
      label: "教师",
      hint: "备课 / 出题 / 批改 / 课件",
      keywords: ["备课", "出题", "批改", "课件", "学情分析"],
      githubQuery: "AI education teacher"
    },
    {
      id: "ecommerce",
      label: "电商",
      hint: "文案 / 评价 / 客服 / 选品",
      keywords: ["商品文案", "评价分析", "客服", "选品", "主图"],
      githubQuery: "AI ecommerce"
    },
    {
      id: "finance",
      label: "财务",
      hint: "报销 / 对账 / 报表 / 发票",
      keywords: ["报销", "对账", "报表", "发票", "预算"],
      githubQuery: "AI finance accounting"
    },
    {
      id: "support",
      label: "客服",
      hint: "话术 / 工单 / 知识库 / 质检",
      keywords: ["话术", "工单", "知识库", "质检"],
      githubQuery: "AI customer support"
    },
    {
      id: "content",
      label: "内容",
      hint: "选题 / 脚本 / 剪辑 / 分发",
      keywords: ["选题", "脚本", "剪辑", "排版", "分发"],
      githubQuery: "AI content creation"
    },
    {
      id: "dev",
      label: "开发",
      hint: "代码 / 测试 / 文档 / 部署",
      keywords: ["代码审查", "测试", "文档", "调试", "部署"],
      githubQuery: "AI coding agent"
    },
    {
      id: "research",
      label: "研究",
      hint: "文献 / 综述 / 数据清洗",
      keywords: ["文献", "综述", "数据清洗", "访谈整理"],
      githubQuery: "AI research assistant"
    },
    {
      id: "learn",
      label: "学习",
      hint: "入门 / 课程 / 提示词",
      keywords: ["入门", "课程", "提示词", "练习"],
      githubQuery: "generative AI for beginners"
    }
  ],
  queryAliases: [
    { match: ["周报", "周报撰写"], query: "weekly report AI" },
    { match: ["会议纪要", "纪要"], query: "meeting minutes AI" },
    { match: ["表格分析", "数据分析"], query: "spreadsheet analysis AI" },
    { match: ["PPT", "演示文稿"], query: "AI PPT generator" },
    { match: ["邮件"], query: "AI email assistant" },
    { match: ["商品文案", "商品描述"], query: "AI product description" },
    { match: ["评价分析", "评论分析"], query: "AI review analysis" },
    { match: ["备课"], query: "AI lesson plan" },
    { match: ["出题"], query: "AI question generator" },
    { match: ["批改"], query: "AI grading" },
    { match: ["报销"], query: "AI expense report" },
    { match: ["对账"], query: "AI reconciliation" },
    { match: ["发票"], query: "AI invoice" },
    { match: ["客服", "话术"], query: "AI customer support" },
    { match: ["选题"], query: "AI content ideas" },
    { match: ["脚本"], query: "AI video script" },
    { match: ["代码审查"], query: "AI code review" },
    { match: ["测试"], query: "AI test generation" },
    { match: ["文献", "综述"], query: "AI literature review" }
  ],
  sources: [
    {
      id: "awesome-llm-apps",
      title: "awesome-llm-apps",
      url: "https://github.com/Shubhamsaboo/awesome-llm-apps",
      source: "GitHub",
      type: "样板库",
      categories: ["dev", "office", "content", "support", "research"],
      description: "100+ AI Agent、Agent Skills 和 RAG 应用，能 clone 下来跑。",
      why: "想找能直接复用的 Agent / RAG 样板，先翻这里。",
      stars: 144403,
      updated: "2026-11",
      caveat: "偏开发者，需要跑代码。"
    },
    {
      id: "500-ai-agents",
      title: "500-AI-Agents-Projects",
      url: "https://github.com/ashishpatel26/500-AI-Agents-Projects",
      source: "GitHub",
      type: "行业用例",
      categories: ["office", "teacher", "ecommerce", "finance", "support", "content", "dev", "research"],
      description: "按行业整理的 500 个 AI Agent 用例，每个都带 GitHub 链接。",
      why: "想按行业找灵感，这里覆盖最广。",
      stars: 39696,
      updated: "2026-11",
      caveat: "偏目录，点进去要自己判断完成度。"
    },
    {
      id: "awesome-ai-apps",
      title: "awesome-ai-apps",
      url: "https://github.com/Arindam200/awesome-ai-apps",
      source: "GitHub",
      type: "样板库",
      categories: ["dev", "support", "content"],
      description: "80+ 个 RAG、Agent、工作流示例，按入门到进阶分类。",
      why: "适合找“能跑起来的最小实现”，再改成自己的流程。",
      stars: 16745,
      updated: "2026-11",
      caveat: "示例偏技术，业务场景要自己套。"
    },
    {
      id: "genai-for-beginners",
      title: "generative-ai-for-beginners",
      url: "https://github.com/microsoft/generative-ai-for-beginners",
      source: "GitHub",
      type: "课程",
      categories: ["learn"],
      description: "微软的 21 课生成式 AI 入门课，含用例和代码。",
      why: "想系统补齐概念，从这门课开始比刷零散帖子稳。",
      stars: 123349,
      updated: "2026-11",
      caveat: "偏学习，不是场景库。"
    },
    {
      id: "ai-skills-for-everyone",
      title: "ai-skills-for-everyone",
      url: "https://github.com/datawhalechina/ai-skills-for-everyone",
      source: "GitHub",
      type: "普通人向",
      categories: ["office", "learn"],
      description: "面向普通人的开源 AI Skill 精选库，按办公场景配中文教程。",
      why: "和这个项目最接近的中文尝试，可以对照它的选品和写法。",
      stars: 105,
      updated: "2026-06",
      caveat: "Alpha 内测，内容还在补。"
    },
    {
      id: "ai-use-cases-library",
      title: "ai-use-cases-library",
      url: "https://github.com/abbasmahdi-ai/ai-use-cases-library",
      source: "GitHub",
      type: "企业用例库",
      categories: ["research", "finance", "ecommerce", "support"],
      description: "3,000+ 个企业 AI 落地案例，按行业、厂商、结果整理。",
      why: "想找“别人公司真的怎么用”，这里有结构化案例。",
      stars: 40,
      updated: "2026-01",
      caveat: "偏案例目录，不是可复现教程。"
    },
    {
      id: "openai-cookbook",
      title: "openai-cookbook",
      url: "https://github.com/openai/openai-cookbook",
      source: "GitHub",
      type: "示例库",
      categories: ["dev", "research"],
      description: "OpenAI 官方的 API 示例和指南，适合找可运行的做法。",
      why: "要动手做原型时，官方示例比二手教程可靠。",
      stars: 77044,
      updated: "2026-11",
      caveat: "偏 API / 代码，不是业务场景。"
    },
    {
      id: "awesome-ai-agents",
      title: "awesome-ai-agents",
      url: "https://github.com/e2b-dev/awesome-ai-agents",
      source: "GitHub",
      type: "合集",
      categories: ["dev"],
      description: "AI Agent 项目清单，按自主性、工具、记忆等方向整理。",
      why: "想找 Agent 方向的对标产品和技术路线。",
      stars: 30897,
      updated: "2026-08",
      caveat: "清单较长，需要自己筛。"
    },
    {
      id: "awesome-generative-ai",
      title: "awesome-generative-ai",
      url: "https://github.com/steven2358/awesome-generative-ai",
      source: "GitHub",
      type: "通用清单",
      categories: [],
      universal: true,
      description: "生成式 AI 项目和服务清单，覆盖面广。",
      why: "不知道从哪查起时，先用它建立全景。",
      stars: 12823,
      updated: "2026-10",
      caveat: "工具清单，不是场景验收。"
    },
    {
      id: "waytoagi",
      title: "通往 AGI 之路",
      url: "https://www.waytoagi.com/",
      source: "内容平台",
      type: "社区 / 知识库",
      categories: [],
      universal: true,
      description: "中文 AI 学习社区，有大量场景、教程和案例。",
      why: "想找中文的真实使用经验，先搜这里。",
      stars: null,
      updated: "持续更新",
      caveat: "内容多而杂，需要自己筛。"
    }
  ],
  searchEngines: [
    {
      id: "google",
      label: "Google",
      template: "https://www.google.com/search?q={q}",
      suffix: " AI 场景",
      note: "通用网页"
    },
    {
      id: "bing",
      label: "Bing",
      template: "https://www.bing.com/search?q={q}",
      suffix: " AI 场景",
      note: "国内可用"
    },
    {
      id: "xhs",
      label: "小红书",
      template: "https://www.xiaohongshu.com/search_result?keyword={q}",
      suffix: " AI",
      note: "真实使用体验"
    },
    {
      id: "zhihu",
      label: "知乎",
      template: "https://www.zhihu.com/search?type=content&q={q}",
      suffix: " AI",
      note: "长文和方案"
    },
    {
      id: "bili",
      label: "B站",
      template: "https://search.bilibili.com/all?keyword={q}",
      suffix: " AI",
      note: "视频教程"
    },
    {
      id: "v2ex",
      label: "V2EX",
      template: "https://www.google.com/search?q=site%3Av2ex.com+{q}",
      suffix: " AI",
      note: "开发者讨论"
    },
    {
      id: "ph",
      label: "Product Hunt",
      template: "https://www.producthunt.com/search?q={q}",
      suffix: "",
      note: "新产品"
    }
  ]
};
