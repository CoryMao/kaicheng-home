import { siteConfig } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

type LinkItem = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  headline: string;
  status: string;
  location: string;
  shortBio: string;
  longBio: string;
  portrait: string;
  email: string;
  links: LinkItem[];
  education: {
    degree: string;
    institution: string;
    time: string;
    detail: string;
  }[];
  experience: {
    role: string;
    organization: string;
    time: string;
    detail: string;
  }[];
  skills: {
    group: string;
    items: string[];
  }[];
  honors: {
    title: string;
    organization: string;
    time: string;
    detail?: string;
  }[];
};

export const profiles: Record<Locale, Profile> = {
  en: {
    name: "Kaicheng Mao",
    headline: "Data Science undergraduate at SUSTech · AI research",
    status: "B.S. Data Science student at Southern University of Science and Technology",
    location: "Shenzhen, China",
    shortBio:
      "I am a Data Science undergraduate interested in deep learning, LLM post-training, and multi-source data processing.",
    longBio:
      "I am a Data Science undergraduate at Southern University of Science and Technology. My project experience spans precipitation nowcasting, Qwen3-0.6B-Base fine-tuning, and interactive image segmentation, with hands-on work in data cleaning, model experimentation, geospatial preprocessing, and algorithm implementation. Outside research and engineering, I am active in varsity volleyball and student leadership.",
    portrait: "/media/profile-portrait.svg",
    email: siteConfig.email,
    links: [
      { label: "GitHub", href: "https://github.com/CoryMao" },
      { label: "Google Scholar", href: "#" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/%E6%81%BA%E8%AF%9A-%E6%AF%9B-482936317/",
      },
    ],
    education: [
      {
        degree: "B.S. in Data Science",
        institution: "Southern University of Science and Technology",
        time: "Sept. 2023 - June 2027",
        detail:
          "GPA: 3.74/4.0 (89.98/100). Relevant coursework includes Advanced Natural Language Processing, Data Structures and Algorithm Analysis, Distributed Storage and Parallel Computing, Statistical Linear Model, and Data Science Practice (Deep Learning).",
      },
      {
        degree: "High School Diploma",
        institution: "Shenzhen Middle School",
        time: "Sept. 2020 - June 2023",
        detail: "Completed high school education in Shenzhen.",
      },
    ],
    experience: [
      {
        role: "Deep Learning Research Project",
        organization: "Deep Learning for Precipitation Nowcasting",
        time: "Feb. 2026 - Present",
        detail:
          "Enhanced the SEVIR dataset with NASADEM-derived elevation, slope, aspect, and land-sea information, and built geospatial preprocessing foundations for terrain-aware precipitation nowcasting experiments.",
      },
      {
        role: "LLM Fine-tuning Project",
        organization: "Fine-tuning Qwen3-0.6B-Base on Nemotron-CC-Math",
        time: "Mar. 2026 - May 2026",
        detail:
          "Fine-tuned Qwen3-0.6B-Base for mathematical domain adaptation and designed a self-contained data cleaning pipeline using regular expressions and Qwen3 itself, without teacher models, tool-calling, search, or external tools.",
      },
      {
        role: "Image Segmentation Project",
        organization: "Intelligent Scissors Project",
        time: "Apr. 2025 - May 2025",
        detail:
          "Implemented an interactive image segmentation system combining Sobel gradient-based edge detection, weighted graph construction, Dijkstra's algorithm, adaptive path stabilization, and cursor snapping.",
      },
      {
        role: "Summer Program Participant",
        organization: "GEM Trailblazer Summer, Nanyang Technological University",
        time: "Jun. 2024 - Jul. 2024",
        detail:
          "Completed coursework in Cities and Urban Life and Introduction to Data Science & Artificial Intelligence, collaborating with peers from diverse educational and cultural backgrounds.",
      },
      {
        role: "Starting Setter",
        organization: "SUSTech Volleyball Team",
        time: "May 2024 - Present",
        detail:
          "Serve as starting setter for the SUSTech varsity volleyball team and competed in Guangdong and Shenzhen intercollegiate volleyball events.",
      },
      {
        role: "President & Undergraduate Captain",
        organization: "SUSTech Volleyball Club & Varsity Volleyball Team",
        time: "Sept. 2025 - Aug. 2026",
        detail:
          "Lead the SUSTech Volleyball Club as president and serve as undergraduate captain of the varsity volleyball team.",
      },
    ],
    skills: [
      {
        group: "Programming",
        items: ["Python", "Java", "R"],
      },
      {
        group: "Machine Learning",
        items: [
          "LLM post-training",
          "Deep learning",
          "Data cleaning",
          "Geospatial preprocessing",
        ],
      },
      {
        group: "English",
        items: [
          "IELTS 7.5",
          "Listening 8.5",
          "Reading 9.0",
          "CET-4 632",
          "CET-6 584",
        ],
      },
      {
        group: "Sports",
        items: ["Volleyball", "Weightlifting", "Powerlifting", "CrossFit"],
      },
    ],
    honors: [
      {
        title: "Most Valuable Player, The 7th SUSTech Volleyball Championship (Student Division)",
        organization: "Southern University of Science and Technology",
        time: "2025",
      },
      {
        title: "Outstanding Student",
        organization: "Southern University of Science and Technology",
        time: "2025",
        detail: "Recognized for exceptional performance in 2025.",
      },
      {
        title: "Third-class Merit Student Scholarship",
        organization: "Southern University of Science and Technology",
        time: "2024-2025",
      },
      {
        title: "Outstanding Student",
        organization: "Southern University of Science and Technology",
        time: "2024",
        detail: "Recognized for exceptional performance in 2024.",
      },
      {
        title: "Third-class Merit Student Scholarship",
        organization: "Southern University of Science and Technology",
        time: "2023-2024",
      },
    ],
  },
  zh: {
    name: "毛恺诚",
    headline: "南方科技大学数据科学本科生 · AI Research",
    status: "南方科技大学数据科学本科生",
    location: "广东深圳",
    shortBio:
      "我是一名数据科学本科生，关注深度学习、LLM 后训练与多源数据处理。",
    longBio:
      "我目前就读于南方科技大学数据科学专业。项目经历覆盖 precipitation nowcasting、Qwen3-0.6B-Base 微调和交互式图像分割，具备数据清洗、模型实验、地理空间预处理与算法实现经验。同时长期参与校队训练与社团管理，具备团队协作和组织领导经验。",
    portrait: "/media/profile-portrait.svg",
    email: siteConfig.email,
    links: [
      { label: "GitHub", href: "https://github.com/CoryMao" },
      { label: "Google Scholar", href: "#" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/%E6%81%BA%E8%AF%9A-%E6%AF%9B-482936317/" },
    ],
    education: [
      {
        degree: "数据科学 本科",
        institution: "南方科技大学",
        time: "2023.09 - 2027.06",
        detail:
          "GPA: 3.74/4.0 (89.98/100)。相关课程包括 Advanced Natural Language Processing、Data Structures and Algorithm Analysis、Distributed Storage and Parallel Computing、Statistical Linear Model、Data Science Practice (Deep Learning)。",
      },
      {
        degree: "高中",
        institution: "深圳中学",
        time: "2020.09 - 2023.06",
        detail: "完成高中阶段学习。",
      },
    ],
    experience: [
      {
        role: "深度学习研究项目",
        organization: "Deep Learning for Precipitation Nowcasting",
        time: "2026.02 - 至今",
        detail:
          "基于 NASADEM 为 SEVIR 数据集补充高程、坡度、坡向和海陆信息，构建地理空间预处理流程，并整理 terrain-aware auxiliary inputs，支持后续短临降水预报实验。",
      },
      {
        role: "LLM 微调项目",
        organization: "Fine-tuning Qwen3-0.6B-Base on Nemotron-CC-Math",
        time: "2026.03 - 2026.05",
        detail:
          "在 Nemotron-CC-Math 上微调 Qwen3-0.6B-Base，用于数学领域适配；设计仅使用正则表达式和 Qwen3 本身的数据清洗流程，不依赖 teacher model、tool-calling、search 或外部工具。",
      },
      {
        role: "图像分割项目",
        organization: "Intelligent Scissors Project",
        time: "2025.04 - 2025.05",
        detail:
          "实现交互式图像分割系统，结合 Sobel gradient-based edge detection、weighted graph、Dijkstra's algorithm、adaptive path stabilization 与 cursor snapping。",
      },
      {
        role: "暑期项目学员",
        organization: "GEM Trailblazer Summer, Nanyang Technological University",
        time: "2024.06 - 2024.07",
        detail:
          "修读 Cities and Urban Life 与 Introduction to Data Science & Artificial Intelligence 课程，并与来自不同教育和文化背景的同学合作交流。",
      },
      {
        role: "主力二传",
        organization: "南方科技大学排球校队",
        time: "2024.05 - 至今",
        detail:
          "担任南方科技大学排球校队主力二传，参加广东省大学生排球联赛、广东省排球锦标赛和深圳市大学生体育竞赛排球赛事。",
      },
      {
        role: "社长 & 本科生队长",
        organization: "南方科技大学排球社 & 排球校队",
        time: "2025.09 - 2026.08",
        detail: "担任南方科技大学排球社社长，并担任排球校队本科生队长。",
      },
    ],
    skills: [
      {
        group: "编程",
        items: ["Python", "Java", "R"],
      },
      {
        group: "机器学习",
        items: ["LLM 后训练", "深度学习", "数据清洗", "地理空间预处理"],
      },
      {
        group: "英语",
        items: [
          "IELTS 7.5",
          "Listening 8.5",
          "Reading 9.0",
          "CET-4 632",
          "CET-6 584",
        ],
      },
      {
        group: "运动",
        items: ["排球", "举重", "力量举", "CrossFit"],
      },
    ],
    honors: [
      {
        title: "最有价值球员，南方科技大学第七届排球锦标赛（学生组）",
        organization: "南方科技大学",
        time: "2025",
      },
      {
        title: "优秀学生",
        organization: "南方科技大学",
        time: "2025",
        detail: "2025 年度表现优异。",
      },
      {
        title: "三等奖学金",
        organization: "南方科技大学",
        time: "2024-2025",
      },
      {
        title: "优秀学生",
        organization: "南方科技大学",
        time: "2024",
        detail: "2024 年度表现优异。",
      },
      {
        title: "三等奖学金",
        organization: "南方科技大学",
        time: "2023-2024",
      },
    ],
  },
};
