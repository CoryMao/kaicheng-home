import type { Locale } from "@/lib/i18n";

type ResearchArea = {
  title: string;
  description: string;
  keywords: string[];
};

type Project = {
  title: string;
  year: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
};

type Publication = {
  title: string;
  venue: string;
  year: string;
  authors: string;
  links: {
    label: string;
    href: string;
  }[];
  highlighted?: boolean;
};

type Activity = {
  title: string;
  organization: string;
  date: string;
  description: string;
};

export type ResearchProfile = {
  areas: ResearchArea[];
  projects: Project[];
  publications: Publication[];
  activities: Activity[];
};

export const researchProfiles: Record<Locale, ResearchProfile> = {
  en: {
    areas: [
      {
        title: "Learning systems and research tooling",
        description:
          "How computational tools can make research workflows easier to inspect, reproduce, and extend.",
        keywords: ["research systems", "reproducibility", "tooling"],
      },
      {
        title: "Human-centered intelligent interfaces",
        description:
          "Interfaces that help people reason with models, data, and complex technical material.",
        keywords: ["HCI", "AI interfaces", "evaluation"],
      },
      {
        title: "Applied data-driven methods",
        description:
          "Practical modeling, measurement, and analysis for questions that benefit from careful empirical work.",
        keywords: ["data analysis", "modeling", "experiments"],
      },
    ],
    projects: [
      {
        title: "Bilingual academic homepage",
        year: "2026",
        summary:
          "A file-driven profile, writing, and life archive built with Next.js, MDX, and localized content.",
        tags: ["Next.js", "MDX", "personal infrastructure"],
        featured: true,
      },
      {
        title: "Research workflow notes",
        year: "2026",
        summary:
          "A living collection of notes about reading papers, designing experiments, and keeping research artifacts organized.",
        tags: ["writing", "workflow", "research practice"],
      },
    ],
    publications: [
      {
        title: "Replace with publication title",
        venue: "Conference / Journal / Workshop",
        year: "YYYY",
        authors: "Kaicheng Mao, Collaborators",
        links: [
          { label: "Paper", href: "#" },
          { label: "Code", href: "#" },
        ],
        highlighted: true,
      },
    ],
    activities: [
      {
        title: "Replace with invited talk or presentation",
        organization: "Lab / seminar / reading group",
        date: "YYYY",
        description:
          "Use this section for talks, posters, teaching, mentoring, or academic service.",
      },
    ],
  },
  zh: {
    areas: [
      {
        title: "学习系统与研究工具",
        description: "关注计算工具如何让研究流程更可检查、可复现、可扩展。",
        keywords: ["研究系统", "可复现性", "工具"],
      },
      {
        title: "以人为中心的智能界面",
        description: "设计帮助人理解模型、数据与复杂技术材料的交互界面。",
        keywords: ["人机交互", "AI 界面", "评估"],
      },
      {
        title: "数据驱动方法应用",
        description: "围绕适合实证工作的具体问题，进行建模、测量与分析。",
        keywords: ["数据分析", "建模", "实验"],
      },
    ],
    projects: [
      {
        title: "双语学术个人主页",
        year: "2026",
        summary:
          "使用 Next.js、MDX 和本地化内容文件构建的个人资料、写作与生活档案。",
        tags: ["Next.js", "MDX", "个人基础设施"],
        featured: true,
      },
      {
        title: "研究工作流笔记",
        year: "2026",
        summary: "持续整理关于读论文、设计实验和管理研究产物的工作方法。",
        tags: ["写作", "工作流", "研究实践"],
      },
    ],
    publications: [
      {
        title: "替换为论文标题",
        venue: "会议 / 期刊 / Workshop",
        year: "YYYY",
        authors: "Kaicheng Mao, Collaborators",
        links: [
          { label: "论文", href: "#" },
          { label: "代码", href: "#" },
        ],
        highlighted: true,
      },
    ],
    activities: [
      {
        title: "替换为报告或展示",
        organization: "实验室 / 研讨会 / 读书会",
        date: "YYYY",
        description: "这里可以放报告、海报、教学、mentoring 或学术服务。",
      },
    ],
  },
};
