# EchoFlow - AI Connected Speech Shadowing Arena (产品设计原型)

> **一句话定位 (One-Sentence Positioning)**
>
> *"EchoFlow 是一款基于 Apple 式滚屏叙事 (Scrollytelling) 的连读影子跟读竞技场。它将声音信号与原生节奏的隐形流态边界可视化，把生硬的单词跟读打磨成行云流水的自然腔调。"*

<img width="1907" height="865" alt="image" src="https://github.com/user-attachments/assets/6d0bd1a9-9bef-46d0-a6e1-2bfb6c377e50" />
<img width="1900" height="867" alt="image" src="https://github.com/user-attachments/assets/7fe506da-ff9f-4231-8685-f8bc4234b2a1" />
<img width="1906" height="865" alt="image" src="https://github.com/user-attachments/assets/b4ffd86f-0ab3-4009-9ea4-3943a6ebab97" />

---

## 📖 产品阐释与洞察 (One-Page Product Pitch)

### 1. 面向谁 (Target Audience)
* **高级英语学习者、出海科技从业者、华人职场精英**：他们的单词发音和词汇语法已经足够标准，但在开会和演讲时，说话依然显得一字一顿，充满“机器人感”的生硬中式节奏。

### 2. 解决什么真问题 (Core Problem)
* 市面上的发音 App（如流利说、ELSA 等）几乎全部关注于**孤立单词 (Isolated Words)** 的元音/辅音准确度。
* 然而，母语者的自然腔调来自于**连读 (Liaisons/Connected Speech)**，即失去爆破、连读、弱读与同化。传统的单词拼读测试完全忽略了词与词之间的流畅物理过渡，导致用户“单词读得都对，连起来说就很难听”。

### 3. 取舍与专注 (Focus & Trade-off)
* **不做**：语法纠错、多选题测试、复杂的账号注册与登录。
* **专注**：极致打磨 10 毫秒级的实时 ASR 语音流匹配动画与左右双轨波形图的对齐，让隐形的“节奏流动感”和“发音连读间隙”变得具象、可触碰。
* **已原生集成**：
  * **智能生词本 (Vocabulary Box)**：允许用户收藏关卡中的难点词汇，侧边栏实时展示与管理。
  * **AI 智能造句训练 (AI Custom Drill)**：基于用户收藏的生词，自动检索/合成并开启专属跟读训练。
  * **游戏化成长系统 (Player Stats)**：包含 XP 积累、10 级发音等级徽章、每日跟读 Streak 签到热力图及最佳得分，让练习极具沉浸感。

---

## 🎨 核心体验与两大惊艳亮点 (Key Highlights)

### 亮点 1：Apple 级 Scrollytelling 滚屏锁定与录音解锁（啊哈时刻）
* **交互流程**：
  * **第一屏**：极简高阶的 Vercel/Linear 暗色美学封面。
  * **第二屏 (跟读竞技场)**：用户滚屏进入时，左侧的目标文本率先显现；随着继续滚动，右侧的“录音控制台”卡片像 Apple 官网硬件展示一样**从右侧边缘平滑滑入**并并排锁定。
  * **滚屏限制 (Scroll Lock)**：为了促使用户进行跟读，当右侧卡片滑入后，**页面滚屏被锁定**，鼠标无法继续下滑，直至录音成功结束。
  * **释放与下行**：录音成功触发 "Voice Captured" 后，页面高度被动态解锁，滚屏限制消失，用户得以向下滑入第三屏进行诊断。

### 亮点 2：实时声控 ASR 歌词流与多维对比诊断
* **实时跟读 (ASR Feed)**：
  * 录音时，左侧面板立刻变身实时解码控制台，未来未读到的单词呈**半透明高斯模糊状态**，当前读到的单词伴有闪烁的绿色光标 `|`。
  * 已读完的单词根据读音准确度被实时赋予三种连读属性的颜色标记：**绿色**（发音精准）、**黄色**（连读有损/辅元过渡生硬）、**红色**（爆破音缺失/发音错误）。
* **多维对比诊断 (Interactive Diagnostics)**：
  * 滑入第三屏后，左侧显示 AI Coach 综合诊断报告与句内发音质量高亮标注，右侧卡片支持三种专业的诊断对比模式：
    1. **AMPLITUDE (振幅)**：重叠母语与用户的真实发音能量曲线，自动识别连读热区 (`LINK 1`, `LINK 2`)。
    2. **PITCH (音高)**：绘制母语与用户 F0 音高走向曲线，支持在曲线上直接点击诊断节点（如 Flat, Low 等）获取个性化的 oral posture（舌位/口型）微调建议。
    3. **FLUENCY & PACE (流利度)**：展示包含发音、连读、语调、流利、语速在内的五维雷达图，并提供每分钟词数 (WPM)、停顿和音节级节奏对比。
  * **气泡翻译与音标 (Dictionary Popover)**：点击任意单词可精准弹出不被遮挡的气泡卡片，提供 IPA 国际音标、中文释义、母语原音朗读（基于 Web Speech Synthesis）和一键加入生词本功能。

---

## 🛠️ AI 工具的驾驭与落地思路 (AI Workflow)

原型完全由 React 19 + TypeScript + Vite + Tailwind CSS 驱动。我借助 AI 完成了从**产品定位定义**到**高保真前端组件动画微调**的开发流程：
1. **美术风格定义 (Vercel/Linear Design System)**：
   * 采用 AI Prompt 引导定制了 `index.css` 的极简暗色配色。使用 `rgba(18, 18, 20, 0.5)` 磨砂玻璃质感、`1px` 极细微反光边框 (`rgba(255, 255, 255, 0.04)`) 和 `emerald-400` 主题绿，营造高端 AI 科技感。
2. **Scrollytelling 粘性与滑动物理量计算**：
   * 引导 AI 使用 React `useEffect` 动态计算页面 `window.scrollY` 与 `window.innerHeight` 的精确比值，生成 `arenaProgress` 与 `diagnosticsProgress`。
   * 通过 `translateX` 运动公式将滚屏进度完美映射到右侧卡片的滑入距离，避免了使用繁重的第三方动效库，实现了零卡顿的原生交互。
3. **交互缺陷纠偏与微调**：
   * **气泡弹窗遮挡问题**：将气泡弹窗从内层 overflow 滚动容器中剥离出来，提升至 Card 层级进行 absolute 定位，并自动进行边界横向 Clamp 限制，确保弹窗永远完美居中且不被裁切。
   * **双气泡渲染冲突**：在 Section 4 左右并排的两张诊断卡片中，原版 AI 生成的代码会导致同一词汇在左右卡片内同时显示弹窗。通过引入 `popoverCardId` 状态机精准标识来源，确保了全局有且只有一个气泡响应。

---

## 🔮 深度迭代规划 (Next Steps)

- [x] ~~**浏览器真实录音与回放 (Web Audio API / MediaRecorder)**：已将原版的模拟声波与得分替换为真实的录音组件，支持捕获麦克风输入并让用户自主播放回听。~~
- [x] ~~**智能生词本系统 (Vocabulary Box)**：已原生集成在侧边栏中，支持生词的收藏与管理。~~
- [ ] **音高基频比对算法升级 (DTW 算法)**：在前端引入动态时间规整算法 (Dynamic Time Warping, DTW)，当用户读完后，抽取用户录音的基频 (F0 Contour) 并将时间轴拉伸对齐，真正绘制出用户声调与外教声调的重叠声图，而非假曲线对比。
- [ ] **多句跟读场景的渐进式过渡**：目前原型支持单句及智能造句替换，后续将设计卡片以淡出滑动的形式无缝推入多句跟读流程，形成如 Apple 宣传页般丝滑的连贯多句探索体验。

---

## 🚀 原型运行与访问方式 (How to Run)

本原型已配置完备的脚手架，可一键在本地运行或构建：

### 本地运行
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动本地开发服务：
   ```bash
   npm run dev
   ```
3. 终端会输出本地访问链接（通常为 `http://localhost:5173/echo-flow/` 或 `http://localhost:5174/echo-flow/`），用浏览器打开即可进行流畅的 Scrollytelling 影子跟读体验。

### 生产构建
* 运行打包命令以生成轻量级的静态 HTML/JS/CSS（打包在 `/dist` 目录中，可直接拖入 Vercel 或 Netlify 部署）：
  ```bash
  npm run build
  ```
