import type { Locale } from "@/lib/i18n";

export const dictionaries = {
  en: {
    navigation: {
      home: "Home",
      research: "Research",
      blog: "Blog",
      life: "Life",
      cv: "CV",
      menu: "Open navigation",
      close: "Close navigation",
    },
    common: {
      readMore: "Read more",
      viewAll: "View all",
      downloadCv: "Download CV",
      openCv: "Open CV",
      latestWriting: "Latest writing",
      lifeNotes: "Life notes",
      selectedResearch: "Selected research",
      updated: "Updated",
      tags: "Tags",
      backToBlog: "Back to blog",
      backToLife: "Back to life",
      email: "Email",
      links: "Links",
    },
    home: {
      eyebrow: "Academic homepage / personal archive",
      intro:
        "Kaicheng's bilingual space for learning, research projects, and life notes.",
      researchCta: "Explore research",
      blogCta: "Read the blog",
      lifeCta: "Browse life notes",
    },
    research: {
      title: "Research",
      description:
        "With the help of my friends and Codex, Claude Code, and others",
      areas: "Generative AI, LLM post-training, multi-source data processing",
      projects: "Selected projects",
      publications: "Publications and outputs",
      activities: "Talks and activities",
    },
    blog: {
      title: "Blog",
      description:
        "Longer notes on research practice, technical work, reading, and ideas in progress.",
      empty: "No posts have been published in this language yet.",
    },
    life: {
      title: "Life",
      description:
        "Short visual notes from everyday life, travel, routines, and small observations.",
      empty: "No life notes have been published in this language yet.",
    },
    cv: {
      title: "CV",
      description:
        "The web CV is for quick browsing, with a downloadable PDF of the full resume available.",
      education: "Education",
      experience: "Experience",
      honors: "Honors and awards",
      skills: "Skills",
      contact: "Contact",
    },
    footer: {
      note: "Built with Next.js, MDX, and a file-driven content workflow.",
    },
  },
  zh: {
    navigation: {
      home: "首页",
      research: "研究",
      blog: "博客",
      life: "生活",
      cv: "简历",
      menu: "打开导航",
      close: "关闭导航",
    },
    common: {
      readMore: "阅读全文",
      viewAll: "查看全部",
      downloadCv: "下载 CV",
      openCv: "打开 CV",
      latestWriting: "最新文章",
      lifeNotes: "生活札记",
      selectedResearch: "研究精选",
      updated: "更新于",
      tags: "标签",
      backToBlog: "返回博客",
      backToLife: "返回生活",
      email: "邮箱",
      links: "链接",
    },
    home: {
      eyebrow: "学术主页 / 个人档案",
      intro:
        "恺诚的双语空间，记录学习、研究项目和生活点滴。",
      researchCta: "查看研究",
      blogCta: "阅读博客",
      lifeCta: "浏览生活札记",
    },
    research: {
      title: "研究",
      description: "在朋友们和 Codex、Claude Code 的帮助下",
      areas: "研究方向",
      projects: "代表项目",
      publications: "论文与产出",
      activities: "报告与活动",
    },
    blog: {
      title: "博客",
      description: "记录研究实践、技术工作、阅读和正在成形的想法。",
      empty: "这个语言版本还没有发布文章。",
    },
    life: {
      title: "生活",
      description: "用短图文记录日常、旅行、习惯和一些微小观察。",
      empty: "这个语言版本还没有发布生活札记。",
    },
    cv: {
      title: "CV",
      description: "网页CV用于快速浏览，亦可下载完整简历的PDF。",
      education: "教育经历",
      experience: "经历",
      honors: "荣誉奖项",
      skills: "技能",
      contact: "联系方式",
    },
    footer: {
      note: "使用 Next.js、MDX 与文件驱动内容工作流构建。",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
