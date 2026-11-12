# 这活能交给 AI 吗？

> 给每个工作任务发一张 AI 工牌。5 个维度、100 分，判断严谨，判决可以好笑。

![status](https://img.shields.io/badge/status-MVP-b23b2e?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-231f1a?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-welcome-3d6b4f?style=flat-square)

你学了一堆 AI 技巧，还是不知道自己的活能不能交给它。  
这里不问“AI 能做什么”，只回答一个问题：**你这个任务，适不适合交给 AI 独立完成？**

**在线评估器**：[https://elapse-li.github.io/can-ai-do-this/](https://elapse-li.github.io/can-ai-do-this/)  
**场景雷达**：[https://elapse-li.github.io/can-ai-do-this/radar.html](https://elapse-li.github.io/can-ai-do-this/radar.html)  
还没部署？见 [本地运行](#本地运行)，双击 `index.html` 就能玩。

```text
┌──────────────────────────────────────┐
│ AI 用工评估所             No. AI-079 │
│                                      │
│ 岗位：周报撰写                       │
│ 结论：试用期                         │
│ 适配分：79 / 100                     │
│                                      │
│ 强项：结构快、不怕空白页             │
│ 风险：编数字、写套话                 │
│ 必检：数字、项目名、时间             │
│                                      │
│ “能用，但别让它碰数据。”             │
└──────────────────────────────────────┘
```

## 30 秒怎么玩

1. 输入你的活，比如“写周报”。
2. 回答 5 个问题：重复度、可验收性、出错代价、数据敏感度、标准明确度。
3. 拿到一张工牌：适配分 + 判决 + 上岗前必检。
4. 点“严肃报告”看五维明细；点“下载工牌 PNG”拿去发群里。

## 它解决什么问题

- 不是不知道 AI 能做什么，是不知道**自己的活**能不能交。
- 不是缺提示词，是缺**判断标准和验收方法**。
- 不是怕 AI 笨，是怕它**自信地胡说**，而你没时间查。

## 评分规则

| 维度 | 分值 | 看什么 |
|---|---:|---|
| 重复度 | 20 | 越常做，越值得沉淀成流程 |
| 可验收性 | 25 | 结果能不能逐项核对 |
| 出错代价 | 20 | 错了多难收场 |
| 数据敏感度 | 15 | 能不能脱敏后再给 |
| 标准明确度 | 20 | 有没有模板、样例、规范 |

分数 = 五个维度得分相加，每个选项的分值都写在 [`assets/app.js`](assets/app.js) 里，可以自行复算。

| 分数 | 判决 | 人话 |
|---:|---|---|
| 85–100 | 直接转正 | AI 主办，你签字 |
| 65–84 | 试用期 | AI 出活，你挑刺 |
| 45–64 | 实习生 | 只能打杂，别给 Key |
| 25–44 | 外聘顾问 | 只准动嘴，不准动手 |
| 0–24 | 永不录用 | 这活它碰了要出事 |

## 已经鉴定过的岗位

| 岗位 | 适配分 | 判决 | 一句话 | 报告 |
|---|---:|---|---|---|
| 周报撰写 | 79 | 试用期 | 能整理结构，但数字和项目状态必须自己核 | [看报告](scenarios/weekly-report.md) |
| 会议纪要 | 73 | 试用期 | 能分清决议和讨论，但人名、负责人、时间要自己核 | [看报告](scenarios/meeting-notes.md) |
| 表格分析 | 76 | 试用期 | 能算数、能解释，但口径要先定，结论要能追溯 | [看报告](scenarios/spreadsheet-analysis.md) |

每张报告都包含：五维评分、最小输入、工作流程、可复制提示词、完整的 before/after 示例、验收清单、翻车案例、数据红线、转正条件。

## 场景雷达

找不到自己的活？打开 [场景雷达](https://elapse-li.github.io/can-ai-do-this/radar.html)：

- 按类别看本站已鉴定的工牌；
- 看精选的开源清单和企业用例库；
- 实时搜 GitHub 上已经完成的项目；
- 一键跳到小红书 / 知乎 / B站 / V2EX / Product Hunt 继续搜。

GitHub 搜索结果只是线索，没有按本项目的标准验收；点“用它做张工牌”后会回到评估器，再自己判断。

> 为什么不做“全网 AI 搜索”？这是一个纯静态站点，没有后端，不能登录平台爬内容。现在的做法是 GitHub API + 人工精选 + 搜索外链，零成本、可部署。要做语义搜索或全网总结，需要后端 + 搜索 API。

## 严肃模式 / 娱乐模式

同一个分数，两套皮肤：

- **工牌文案**：判决、评语、风险标签。这里是玩笑。
- **严肃报告**：五维明细、评分依据、必检项、数据红线、转正条件。这里不开玩笑。

**玩笑只改称呼，不改分数。** 分数由规则算出，任何选项都可以复算。

## 这不是又一个 awesome 清单

- 不做“500 个场景”，每周只加 1–2 个岗位，宁缺毋滥。
- 每张卡必须有可复现的 before/after 示例；没有样例的 AI 生成卡片不收。
- 每张卡必须写清楚“怎么验收”和“什么时候会翻车”。
- 评分规则公开，换模型后重新验证，标注最后验证日期。

## 项目结构

```text
.
├── index.html                  # 评估器 + 工牌生成
├── radar.html                  # 场景雷达：分类 + 精选 + GitHub 搜索
├── assets/
│   ├── styles.css
│   ├── app.js                  # 题库、评分、Canvas 工牌
│   ├── radar.css
│   └── radar.js                # 雷达页面交互
├── scenarios/                  # 岗位卡：评分、提示词、验收、红线
├── examples/                   # 真实 before/after
├── data/
│   ├── scenarios.json          # 机器可读的岗位索引
│   └── radar.js                # 类别、精选清单、搜索入口
├── CONTRIBUTING.md
└── LICENSE
```

## 本地运行

```bash
git clone https://github.com/Elapse-Li/can-ai-do-this.git
cd can-ai-do-this
python -m http.server 8000
```

打开 `http://localhost:8000`。评分器是纯静态的，直接双击 `index.html` 也能用；起本地服务器只是为了 Markdown 链接跳转更顺。

## 部署到 GitHub Pages

1. 把仓库推到 GitHub。
2. **Settings → Pages → Source** 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。
3. 把 [`assets/app.js`](assets/app.js) 顶部的 `REPO_URL` 改成你的仓库地址。
4. 把 README 顶部的在线评估器地址换成你的 Pages 地址。
5. 等一分钟，打开 `https://elapse-li.github.io/can-ai-do-this/`。

## 参与贡献

三种方式：

1. **提交一个待鉴定任务**：用 [任务鉴定 issue 模板](.github/ISSUE_TEMPLATE/task-review.yml)，说说你的活、输入、产出和最怕它哪里出错。
2. **写一张岗位卡**：复制 [`scenarios/weekly-report.md`](scenarios/weekly-report.md)，按同样结构填。
3. **改评分规则**：带上理由和一个反例，欢迎直接开 issue 辩论。

不收：纯 prompt 合集、工具广告、没有真实样例的 AI 生成卡片、涉及真实客户隐私的数据。

## Roadmap

- [x] 评分器 + 工牌生成
- [x] 3 个岗位：周报、会议纪要、表格分析
- [x] 场景雷达：本站 + 精选清单 + GitHub 实时搜索
- [ ] 10 个岗位：办公、教师、电商
- [ ] 工牌分享页 / 榜单
- [ ] 英文版
- [ ] 公开 JSON 数据集 / API

## 免责声明

- 评分针对**任务**，不针对人；不构成裁员、绩效或法律建议。
- AI 输出必须人工复核；不要上传密钥、密码、客户名单等敏感信息。
- 评分是启发式工具，不是科学测量；模型能力变化后，结论可能变化。

## English

**Can this task be handed to AI?** A 5-question rubric that issues an "AI employee badge" — rigorous scoring, playful verdict. Chinese-first; the rubric, data and scoring model are language-agnostic.

## License

[MIT](LICENSE)

---

如果这个思路帮你少踩一个“AI 自信胡说”的坑，点个 star 就算付过费了。
