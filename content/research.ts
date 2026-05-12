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
    areas: [],
    projects: [
      {
        title: "GRPO Post-Training for Math Reasoning",
        year: "2026",
        summary:
          "Systematically explored SFT-to-GRPO post-training on Qwen3-0.6B-Base, improving math reasoning accuracy from 38.2% to 55.2% through reward function design and None discrimination.",
        tags: ["GRPO", "RL", "post-training", "math-reasoning"],
        featured: true,
      },
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
    publications: [],
    activities: [],
  },
  zh: {
    areas: [],
    projects: [
      {
        title: "GRPO 数学推理后训练",
        year: "2026",
        summary:
          "系统探索 Qwen3-0.6B-Base 的 SFT 到 GRPO 后训练流程，通过奖励函数设计与 None 判别将数学推理准确率从 38.2% 提升至 55.2%。",
        tags: ["GRPO", "RL", "后训练", "数学推理"],
        featured: true,
      },
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
    publications: [],
    activities: [],
  },
};
