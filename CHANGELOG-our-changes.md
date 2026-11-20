# 我们的修改记录 / Modifications Notice

本项目是 [new-api](https://github.com/QuantumNous/new-api) 的修改版本。
This is a modified version of new-api.

- 上游版本 / Upstream: `v1.0.0-rc.43`
- 上游许可 / License: GNU AGPL v3.0(含 NOTICE 中的 §7 附加条款)
- 本修改方 / Modified by: AiNode(ZUA-CV2023)
- 上游来源 / Upstream source: <https://github.com/QuantumNous/new-api>

依据 AGPLv3 §7(c),本文件记录我们对上游代码的全部修改。
Per AGPLv3 §7(c), every change we make to the upstream source is recorded here.

**阅读提示**:标「新增文件」的条目不会影响上游升级合并;标「修改源码」的需要在每次
同步上游时留意冲突。

---

## 修改 1:豆包视频渠道支持「拉取上游模型」

**类型**:修改源码
**日期**:2026-10-19
**文件**:`controller/channel_upstream_update.go`
**位置**:`fetchChannelUpstreamModelIDs()` 内的 URL 分支

**改前**

```go
case constant.ChannelTypeVolcEngine:
```

**改后**

```go
case constant.ChannelTypeVolcEngine, constant.ChannelTypeDoubaoVideo:
```

**原因**

`ChannelTypeDoubaoVideo`(54)与 `ChannelTypeVolcEngine`(45)使用同一个方舟基础地址
`https://ark.cn-beijing.volces.com`,模型列表端点同为 `/api/v3/models`。

改动前,54 会落到 `switch` 的 `default` 分支,拼接出 `{base}/v1/models`,而方舟不提供
该端点,导致「拉取模型」固定 404 失败。

**验证结果(2026-10-20 实测)**

上游端点对照(直连火山方舟,同一把 API Key):

| 端点 | 状态码 | 含义 |
| --- | --- | --- |
| `/v1/models` | **404** | 改动前代码请求的路径,必然失败 |
| `/api/v3/models` | **200** | 改动后请求的路径,可用 |

部署与功能验证:

- 线上版本号:`v1.0.0-rc.43+092982c`(证明改动已编入运行镜像)
- 后台 → 渠道 → 豆包渠道 → 拉取模型:**成功返回模型列表**

**结论**:本修改使豆包视频渠道的模型列表发现功能可用。

---

## 修改 2:`Dockerfile` 增加可覆盖的构建参数

**类型**:修改源码
**日期**:2026-10-19
**文件**:`Dockerfile`

**内容**

- `builder` 阶段新增 `ARG NPM_REGISTRY=https://registry.npmjs.org/`,
  并让 `bun install` 使用 `--registry=${NPM_REGISTRY}`
- `builder2` 阶段新增 `ARG GOPROXY=https://proxy.golang.org,direct`,
  并追加到 `ENV` 中

**原因**

上游默认使用官方源。中国大陆构建时 `go mod download` 与 npm 拉取会非常慢甚至失败。
把源暴露成 build-arg 后,可在不改文件的前提下覆盖为国内镜像站。

**影响**

默认值保持上游行为,不传参数时与上游完全一致。不影响运行时代码。

---

## 修改 3:`build-image.sh` 增强与缺陷修复

**类型**:修改文件(该脚本为本 fork 新增,非上游文件)
**日期**:2026-10-19 / 2026-10-20
**文件**:`build-image.sh`

**内容**

1. 新增 `REGISTRY` / `NAMESPACE` 环境变量,组合出可推送的完整镜像地址
2. 新增 `--push` 参数,构建完成后直接推送
3. **Docker 标签净化**:版本号含 `+` 用于前端解析,但 Docker 标签只允许
   `[a-zA-Z0-9._-]`,故标签中把 `+` 替换为 `_`
4. **`VERSION` 精确还原**:构建后还原为原始字节(可能为 0 字节),避免每次构建后
   `git status` 出现无意义改动
5. 修复 `set -euo pipefail` 下的两处隐患(`cat VERSION` 失败、`[[ ]] &&` 短路)

**原因**

第 3 点若不修,`docker build -t ...:v1.0.0-rc.43+xxx` 会直接报
`invalid reference format`,构建无法完成。

---

## 修改 4:`verify-deploy.sh` 版本号示例修正

**类型**:修改文件(本 fork 新增)
**文件**:`verify-deploy.sh`

**内容**

使用说明里的示例 `v1.0.0-rc.43-a1b2c3d` 改为 `v1.0.0-rc.43+a1b2c3d`。

**原因**

前端 `web/src/features/system-update/releases.ts` 的版本解析正则只允许
`-` 后接 `alpha|beta|rc|patch`,自定义后缀必须用 `+`。原示例与真实规则矛盾。

---

## 修改 5:新增构建流水线

**类型**:新增文件
**日期**:2026-10-20
**文件**:`.github/workflows/build-image.yml`

**内容**

- 触发条件:`push` 到 `main`(版本号 = 基线 + commit 短哈希)、`push` 形如 `v*` 的
  tag(版本号 = tag 名)、手动触发
- 构建前 `Preflight` 校验 4 个 ACR secret 是否存在、格式是否合法、域名是否可解析
- 构建时写入 `VERSION`,使版本指纹编入后端二进制与前端
- 推送到阿里云 ACR,同时打精确版本标签与 `latest`
- 关闭 `provenance` / `sbom`

**说明**

关闭 attestation 是必需的:阿里云 ACR 个人版不支持 buildx 附加的
`application/vnd.oci.empty.v1+json` 清单,推送会被拒绝并报
`unknown manifest class`。

---

## 修改 6:删除上游发布相关 workflow

**类型**:删除文件
**日期**:2026-10-19
**文件**

- `.github/workflows/docker-build.yml`
- `.github/workflows/docker-image-branch.yml`
- `.github/workflows/electron-build.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sync-release-to-gitcode.yml`

**原因**

这些流水线会向 `calciumion/new-api` 推送镜像、创建 Release,依赖上游仓库的 Secrets。
在本 fork 中缺少对应凭据,任何 tag 推送都会失败并产生无意义的失败记录。

**保留**:`.github/workflows/ci.yml`(由 `pull_request` 触发,执行测试与检查)。

---

## 修改 7:`THIRD-PARTY-LICENSES.md` 复制到仓库根目录

**类型**:新增文件(内容取自 `read/THIRD-PARTY-LICENSES.md`)
**文件**:`THIRD-PARTY-LICENSES.md`(根目录)

**原因**

`Dockerfile` 第 46 行从构建上下文根目录复制该文件:

```dockerfile
COPY LICENSE NOTICE THIRD-PARTY-LICENSES.md /licenses/
```

而上游源码包把该文件放在 `read/` 子目录,导致 `docker build` 报
`THIRD-PARTY-LICENSES.md: not found`。

选择复制而非修改 Dockerfile,是为了减少与上游的差异。

---

## 修改 8:新增 README

**类型**:新增文件
**文件**:`README.md`

**内容**

项目说明、与上游的差异表、构建与部署步骤、许可证说明,以及依 AGPLv3 §13
向网络用户提供完整对应源码的途径。

**原因**

上游把文档放在 `read/` 子目录,仓库根目录原本只有建仓时的占位 README。
本 fork 需要在首页明确来源声明与源码提供方式。

---

## 修改 9:品牌资源替换为 AiNode

**类型**:修改文件 + 替换二进制资源
**日期**:2026-10-20
**文件**

- `web/index.html`
- `web/src/assets/logo.tsx`
- `web/public/logo.png`(替换)
- `web/public/favicon.ico`(替换)

**内容**

1. `web/index.html`:静态 `<title>` 与 `<meta name="title">` 由 `New API` 改为 `AiNode`;
   `description` 前缀加入 `AiNode -`。
2. `web/src/assets/logo.tsx`:SVG 的 `<title>` 由 `New API` 改为 `AiNode`。
3. `web/public/logo.png`:替换为 AiNode 标志(180×180,透明背景)。
4. `web/public/favicon.ico`:替换为 AiNode 标志(含 16/32/48/64/128/256 六种尺寸)。

**原因**

- 静态标题写死为 `New API`,浏览器标签页在 React 挂载前会短暂显示上游名称。
  `src/main.tsx` 的 `initSystemBranding()` 只在 localStorage 有缓存时才提前改写标题,
  首次访问或无痕模式下无可避免地闪烁。改为 `AiNode` 后首屏即正确,运行时的
  `/api/status` 覆盖逻辑保持不变,后台改名依然生效。
- `logo.png` 与 `favicon.ico` 为上游品牌资源,需替换为本方标志。

**影响**

- 仅前端静态资源与文案,不涉及后端逻辑、接口或计费。
- 前端产物经 `//go:embed` 编入二进制,需重新构建镜像后生效。

**说明**

`logo.png` 由源图裁去透明留白(原图 500×500,实际标志仅 218×225)后加 8% 边距,
重采样至 180×180;favicon 由同一结果生成多尺寸。裁切是必要的 —— 否则 16×16 下
标志会因留白而缩小到难以辨认。

---

## 修改 10:清理源码中的品牌残留

**类型**:修改源码
**日期**:2026-10-27
**文件**

- `common/constants.go`
- `main.go`

**内容**

1. `common/constants.go`:`var SystemName = "New API"` 改为 `"AiNode"`。

   这是数据库里没有 `SystemName` 配置时的兜底默认值,影响启动横幅、浏览器标题、
   邮件标题、passkey 显示名等。**仅对全新空数据库生效** —— 已有数据库中的值优先,
   因此不影响当前已上线实例的显示。

2. `main.go`:启动日志 `"New API %s started"` 改为 `"AiNode %s started"`。

3. `main.go`:panic 响应中的问题反馈链接由上游
   `github.com/Calcium-Ion/new-api` 改为 `github.com/ZUA-CV2023/AiNode`。

4. `main.go`:删除注入进页面 HTML 的品牌注释
   `<!--Umami QuantumNous-->` 与 `<!--Google Analytics QuantumNous-->`。

**原因**

前三项是面向部署者与客户端的可见文案。第三项会在服务端 panic 时随 500 响应返回。

第四项需要特别说明:这两行注释的写入语句位于 `if os.Getenv(...)` **之外**,
因此即使未启用 Umami / Google Analytics,也会被替换进 `index.html` 的占位符,
导致**每个页面的 HTML 源码中都含有上游标识**(右键「查看网页源代码」即可见)。

**影响**

- 前三项仅改文案,不影响逻辑。
- 第四项删的是 HTML 注释,占位符改为替换成换行符,页面行为不变。

**有意未修改的内容**

以下保留上游标识,因为它们承载**功能语义**而非品牌,修改会造成误解或破坏兼容:

| 位置 | 保留原因 |
| --- | --- |
| `constant.ChannelTypeNewAPI` 及渠道类型显示名 `"New API"` | 指「上游是 New API 实例」的渠道类型,是功能标签 |
| `common/database.go` 的 `one-api.db` | 数据库文件名,改动会导致既有数据无法读取 |
| 所有 `github.com/QuantumNous/new-api/...` 导入路径 | Go 模块名,改动会使上游同步无法合并 |
| `LICENSE` / `NOTICE` / 文件版权头 / 页脚署名 | AGPLv3 §7 附加条款要求保留 |

---

## 修改 11:登录/注册页与首页视觉改版

**类型**:修改源码(前端)
**日期**:2026-10-31
**提交**:`7cfad98`
**主要文件**

- 新增:`web/src/lib/password-strength.ts`、`web/src/components/password-strength-meter.tsx`、`web/scripts/add-missing-keys.mjs`
- 修改:`web/src/features/auth/`(auth-layout、sign-in、sign-up)、`web/src/features/home/`(hero、hero-terminal-demo、cta、features、how-it-works、stats)、`web/src/components/`(password-input、layout/components/public-header)、`web/src/styles/`(index.css、theme.css)、7 个 `web/src/i18n/locales/*.json`

**内容**

1. 新增密码强度提示:0~4 分评分(长度与字符种类),注册页密码框下方显示四段条与「弱/中等/强/非常强」文案;仅作客户端提示,真实策略仍由 `accountPasswordSchema` 与后端强制。
2. 登录/注册页重做:浅色渐变背景、左侧品牌展示区(大号渐变品牌名、玻璃胶囊卖点、星球/星光装饰),右侧居中卡片并加 logo;登录页把注册入口与条款移到表单下方。
3. 首页改版:Hero 增加装饰插画(轨道粒子、渐变核心、能力卡片),终端演示强调色统一为 `primary`,CTA 按钮改为胶囊并指向 `/sign-in`,其余区块样式随新主题调整。
4. 主题与动效:`theme.css` 主色改为 `#158eff`、圆角基准 `1rem` → `0.5rem`、默认字体栈改为 Lato/PingFang SC/Noto Sans SC 等;`index.css` 新增 `landing-orbit` / `auth-twinkle` 动画,并遵守 `prefers-reduced-motion`。
5. i18n:7 个 locale 重新生成并排序;`add-missing-keys.mjs` 为密码强度文案补齐 7 种语言。

**原因**

仓库外已有一轮本地视觉改版,需要把最终版本同步进仓库,并统一主题 token。

**影响**

- 只改前端,后端接口、计费和数据库均未改动。
- 主色、圆角基准与默认字体栈是全局 token,会影响全部页面,不只登录页和首页。
- 新增文案已进入 7 个 locale 文件。

**验证**

- CI 构建成功(GitHub Actions run #5,版本 `v1.0.0-rc.43+7cfad98`)。
- 该提交包含在当前线上版本 `v1.0.0-rc.43+bbd9a0f` 中。
- 未新增自动化测试。

---

## 修改 12:首页统计/流程区块替换为模型与优势区块

**类型**:修改源码(前端)
**日期**:2026-10-31
**提交**:`ce99081`
**主要文件**

- 新增:`web/src/features/home/components/sections/models.tsx`、`web/src/features/home/components/sections/advantage.tsx`
- 修改:`web/src/features/home/index.tsx`、`web/src/features/home/components/index.ts`、`sections/features.tsx`、`sections/hero.tsx`、`web/src/features/auth/auth-layout.tsx`、`web/src/styles/index.css`、`web/src/i18n/locales/zh.json`、`zh-TW.json`

**内容**

1. 新增 `Models` 区块:两行模型 logo 跑马灯(OpenAI/Claude/Gemini/Qwen/DeepSeek/豆包等),下方四项统计(500+ 模型、50+ 上游、50+ 兼容路由、99.9% 可用性)带滚动进入计数动画。
2. 新增 `Advantage` 区块:高可用接入、服务保障、透明计费三张卡片。
3. 首页顺序改为 Hero → Models → Advantage → Features → CTA;`components/index.ts` 不再导出 `Stats` / `HowItWorks`;`features.tsx` 重写为四张能力卡;`hero.tsx` 删除原下半部分内容。
4. 登录页品牌展示区改为玻璃胶囊卖点 + 渐变装饰条。
5. 新增文案只写入 `zh.json` / `zh-TW.json`。

**原因**

原 `Stats` / `HowItWorks` 与新的首页信息结构重复,统一改为「模型支持 + 平台优势 + 能力」三段。

**影响**

- 前端首页内容结构变化,后端无改动。
- **i18n 缺口**:本提交新增的 key 未同步到 `en/fr/ja/ru/vi`,这五种界面语言会回退显示英文(已在修改 17 补齐)。
- `how-it-works.tsx` / `stats.tsx` 文件仍保留在仓库中但已无引用,属于遗留死文件。

**验证**

- CI 构建成功(GitHub Actions run #6,版本 `v1.0.0-rc.43+ce99081`)。
- 该提交包含在当前线上版本 `v1.0.0-rc.43+bbd9a0f` 中。
- 未新增自动化测试。

---

## 修改 13:登录页与输入框深色模式修复

**类型**:修改源码(前端)
**日期**:2026-11-02
**提交**:`4341d92`
**文件**:`web/src/features/auth/auth-layout.tsx`、`web/src/features/auth/sign-in/components/user-auth-form.tsx`

**内容**

- 登录页外层背景补 `dark:bg-[#0b1020]`,背景光晕在深色下 `dark:opacity-20`,登录卡片补 `dark:bg-[#121a2c]/90`,品牌胶囊补深色边框/背景/文字与 hover 颜色。
- 登录表单用户名与密码输入框补 `dark:bg-white/5`。

**原因**

登录页此前只按浅色背景设计;深色模式下外层仍是浅色背景、卡片与输入框仍是白底,对比度和一致性都不对。

**影响**

只改样式,浅色模式不变。

**已知问题**

同一提交把品牌胶囊的浅色文字类写成 `ttext-[#0f172a]`(应为 `text-`),Tailwind 不会生成该类,浅色模式下文字颜色会回退到继承值。待后续修复。

**验证**

- 该提交没有单独的 CI 运行;紧随其后的 `c438989` 构建(run #7)包含它的代码。
- 该提交包含在当前线上版本 `v1.0.0-rc.43+bbd9a0f` 中。
- 未新增自动化测试。

---

## 修改 14:豆包视频在预扣费前校验时长

**类型**:修改源码(任务插件)
**日期**:2026-11-02
**提交**:`c438989`
**文件**:`plugins/tasks/doubao/plugin.js`

**内容**

新增 `videoDuration(ctx)`,在 `buildSubmitRequest` 中、`videoResolution` 之后调用:

- `seconds` 缺省或空串:不处理,交给方舟默认值(预扣仍按模型最长时长估算,属于多扣而非少扣)。
- 非整数或 `<= 0`:报错(`-1` 例外)。
- `-1`:放行,表示由模型选择时长;插件已声明 `duration-auto@1`,宿主会按最长时长预扣、按上游回报结算。
- 超过 `profile.maxDuration`(按模型为 12/15/30 秒):报错。

**原因**

用户可控的 `seconds` 是计费乘数。预扣按模型最长时长估算,超长请求原本要等上游失败后才退款,期间额度被占用。按计费不变量,必须在预扣前限界并返回 400。

**影响**

- 只影响豆包视频任务提交校验,合法请求行为不变,错误信息带模型名。
- 宿主层另有 `relaycommon.MaxTaskDurationSeconds` 兜底,本改动是纵深防御。

**验证**

- CI 构建成功(GitHub Actions run #7,版本 `v1.0.0-rc.43+c438989`)。
- 该提交包含在当前线上版本 `v1.0.0-rc.43+bbd9a0f` 中。
- 未新增插件测试。

---

## 修改 15:任务媒体支持重定向到上游 URL

**类型**:修改源码
**日期**:2026-11-07
**提交**:`bbd9a0f`
**文件**:`controller/video_proxy.go`

**内容**

新增 `TASK_MEDIA_REDIRECT` 环境变量(默认 `false`)。开启后,若媒体请求无凭据、无自定义头、目标是不自环的外部 http(s) URL,则返回 `302` 让客户端直连上游;否则继续由本服务代理。同时新增:

- `requestIsHTTPS`:识别 `X-Forwarded-Proto` 或 TLS 状态。
- `originTaskMediaRedirectable`:只允许绝对 http(s)、非同源地址;https 页面不降级到 http,避免混合内容拦截。

**原因**

大文件媒体播放会占用服务器出口带宽;把无凭据的媒体请求交给客户端直连上游,可把本服务从数据路径上移开。

**影响**

- 默认关闭,现有行为不变。
- 开启后依赖上游 URL 在整个播放期可公开访问;客户端会直接看到上游 URL 并连接上游,上游看到的是客户端 IP 而不是本服务 IP。这是用带宽换来的取舍。
- 带凭据或自定义头的请求始终走代理,不会因重定向泄露凭据。

**验证**

- CI 构建成功(GitHub Actions run #8,版本 `v1.0.0-rc.43+bbd9a0f`)。
- 当前线上版本即 `v1.0.0-rc.43+bbd9a0f`,容器 healthy。
- 未新增自动化测试;该开关默认关闭,线上未启用。

---

## 修改 16:CI 测试门禁复用 ci.yml

**类型**:修改文件(本 fork 的 workflow)
**日期**:2026-11-09
**文件**:`.github/workflows/ci.yml`、`.github/workflows/build-image.yml`

**内容**

1. `ci.yml` 增加 `workflow_call` 触发器;两处 checkout 的 `repository` 改为 `github.event.pull_request.base.repo.full_name || github.repository`,使其在 PR 与 push/workflow_call 下都能取到仓库。
2. `build-image.yml` 新增 `test` job,通过 `uses: ./.github/workflows/ci.yml` 复用整套检查;`build` 增加 `needs: test`。

**原因**

此前 `ci.yml` 只在 `pull_request` 触发;直接 push main 时只有 `build-image` 运行,而它只构建不测试,测试没跑过也会构建并推送 `:latest`。

**影响**

- 每次 push main / tag 会先跑后台 `go vet`、`go build`、`make test` 与前端 `typecheck`、`test`;失败则不构建、不推送。
- 构建总时长增加(测试约几分钟);PR 流程不变;不改业务代码。
- 这是对上游 `.github/workflows/ci.yml` 的改动,同步上游时需留意 `on`、checkout 与 `concurrency` 段落。

**验证**

- 已用 PyYAML 解析两个工作流,语法通过。
- 尚未 push,真实运行待首次 push 后确认(本地提交不会触发 CI)。
- `test` job 本身不设置 `concurrency`;`ci.yml` 顶层的 `concurrency` 保留,用于 PR 运行。

---

## 修改 17:站内用户反馈(用户提交 + 后台管理)

**类型**:修改源码(后端 + 前端)
**日期**:2026-11-19
**文件**

- 新增:`model/feedback.go`、`model/feedback_test.go`、`controller/feedback.go`、`web/src/features/feedback/`、`web/src/routes/_authenticated/feedback/index.tsx`
- 修改:`model/main.go`(AutoMigrate)、`router/api-router.go`(路由)、`web/src/components/profile-dropdown.tsx`(用户入口)、`web/src/hooks/use-sidebar-data.ts`(后台菜单)、`web/src/routeTree.gen.ts`(路由生成)、`web/scripts/add-missing-keys.mjs`、7 个 `web/src/i18n/locales/*.json`

**内容**

1. 新增 `feedback` 表(单数表名):`id`、`user_id`、`category`、`content`、`contact`、`page_url`、`user_agent`、`status`、`admin_note`、`created_at`、`updated_at`;索引 `created_at`、`user_id`、`status`;时间沿用仓库其它表的 int64 Unix 秒。已加入 `migrateDB` 的 AutoMigrate 列表,部署后首次启动自动建表。
2. 用户端 `POST /api/feedback`(UserAuth):`category` 必须是 bug/feature/other;`content` 去首尾空白后 10–2000 字;`contact` ≤255 字;`page_url` / `user_agent` 截断 255 字;同一用户 24 小时内最多 10 条;成功返回 `{id}`。
3. 用户端 `GET /api/feedback`(UserAuth):只返回自己的反馈,支持 `p` / `page_size`,按时间倒序;响应不含管理员备注。
4. 管理端 `GET /api/feedback/list`(AdminAuth):支持 `p`、`page_size`、`status`、`category`、`keyword`;`keyword` 匹配 id、user_id、content、contact、page_url、user_agent。
5. 管理端 `PUT /api/feedback/:id`(AdminAuth):修改 `status` 与 `admin_note`,并写管理审计日志(`feedback.update`)。
6. 本期不做删除,避免误删;后续需要可加软删除。
7. 前端用户入口:头像下拉菜单新增「反馈」,打开 Modal(类型、内容、联系方式可选),提交时自动带当前页面 URL;底部隐私告知「提交内容会记录你的账号和当前页面,仅用于改进产品」。
8. 前端后台:新增「反馈管理」页面,表格、状态/类型筛选、关键字搜索、详情查看;详情内修改状态、填写管理员备注并保存。菜单挂在侧栏 Admin 分组,路由守卫要求 `ROLE.ADMIN`,接口用 AdminAuth。
9. i18n:新增文案进入 en / zh / zh-TW / fr / ja / ru / vi 七种语言;locale 写入仍走 `add-missing-keys.mjs` + `bun run i18n:sync`。
10. 顺带补齐修改 12 遗留的 45 个首页文案缺口(en/fr/ja/ru/vi),避免 `i18n:sync` 把中文值写进非中文语言包。

**原因**

需要一个站内反馈入口和后台处理闭环。邮件 / 企微 / 微信群通知本期不做,但数据模型和 API 没有写死通知渠道,后续可在保存后挂通知。

**影响**

- 新增表;部署后首次启动会执行 AutoMigrate 创建 `feedback`,不改既有表。
- 新增 2 条用户接口和 2 条管理接口;用户接口按 `user_id` 隔离,管理接口为 AdminAuth。
- 前端新增页面与入口,不引入新依赖。
- 对上游同步:新增文件不冲突;`model/main.go`、`router/api-router.go`、`profile-dropdown.tsx`、`use-sidebar-data.ts` 与生成的 `routeTree.gen.ts` 会在同步上游时产生冲突。

**验证**

- `go build ./...` 通过。
- `go test ./model -run Feedback -count=1` 通过;`go test ./model -count=1` 通过。
- `bun run build` 通过(已重新生成 `routeTree.gen.ts`)。
- `bun run typecheck` 通过。
- 新增 `feedback-dialog.test.tsx` 3 项通过;`bun run test` 全量通过。
- 变更文件 scoped `oxlint` 0 error / 0 warning;全仓 `bun run lint` 仍有既有 error(与本次改动无关)。
- 尚未 push、未部署、未对线上做任何操作。

**已知限制与待办**

- 多库迁移验证待补:线上为 SQLite(`/opt/new-api/data/one-api.db`),本地无 MySQL/PostgreSQL 实例;本次不阻塞上线,后续补三库验证。
- 后台权限使用 AdminAuth、同一用户 24 小时最多 10 条、不做删除,均已确认。
- 邮件 / 企微 / 微信群通知本期不做;数据模型和 API 未写死通知渠道,后续可在保存后挂通知。
- 频率限制为 count-then-insert,极端并发下可能略超 1 条;如需严格原子性,后续可加 Redis 或事务锁。

---

## 修改 18:后台反馈列表与详情显示提交者身份

**类型**:修改源码(后端 + 前端)
**日期**:2026-11-20
**文件**

- 后端:`model/feedback.go`、`model/feedback_test.go`
- 前端:`web/src/features/feedback/types.ts`、`components/feedback-columns.tsx`、`components/feedback-detail-dialog.tsx`、`web/scripts/add-missing-keys.mjs`、7 个 `web/src/i18n/locales/*.json`

**内容**

1. 管理端列表查询 `LEFT JOIN users`(排除软删除用户),带出 `username` / `email`;用户不存在或已软删时标记 `user_deleted=true`。
2. 前端列表优先显示 username,缺失时显示 email,再缺失回退 `User {{id}}`;已注销显示「已注销」。详情显示 `User ID`、`Username`、`Email`。
3. 用户端 `GET /api/feedback` 保持不变,不返回 username/email/admin_note;email 只在 AdminAuth 的管理端返回。

**原因**

管理员只能看到 `user_id` 时无法识别提交者,反馈处理需要知道是谁提交的。

**影响**

- 只影响管理端列表/详情;查询多一次 `LEFT JOIN users`(关联主键)。
- 用户端接口不泄露邮箱;邮箱仅管理员可见。

**验证**

- `go build ./...` 通过。
- `go test ./model -run Feedback -count=1` 通过(含新增的 `TestGetAllFeedbackIncludesUserIdentity`)。
- `bun run typecheck` 通过;`bun run build` 通过。
- `bunx vitest run src/features/feedback` 3 项通过。
- 变更文件 scoped `oxlint` 0 error / 0 warning。
- 尚未 push、未部署。

---

## 新增的本地部署文件

以下文件为本 fork 新增,不属于上游:

- `ainode.service` —— systemd 部署模板(占位路径,当前未使用)
- `build-image.sh` —— 本地构建脚本(见修改 3)
- `verify-deploy.sh` —— 部署验证脚本(见修改 4)
- `CHANGELOG-our-changes.md` —— 本文件

---

## 未修改但必须保留的上游内容

以下内容按上游 `NOTICE` 的 §7 附加条款要求**保留,不得删除**:

- `LICENSE`、`NOTICE`、`THIRD-PARTY-LICENSES.md` 原样保留
- 各源文件头部的 `Copyright (C) 2023-2026 QuantumNous` 及 AGPL 声明
- 前端页脚的项目署名 `Frontend design and development by New API contributors.`
  及指向 <https://github.com/QuantumNous/new-api> 的可见链接
- 关于页的来源声明(One API / QuantumNous / JustSong)

本修改版本不得歪曲软件来源。上游署名归 QuantumNous 及贡献者所有,
本修改方仅对本文件列出的修改内容负责。

---

## 构建与部署

```bash
# 在源码根目录执行
docker build -t ainode:dev .

# 或使用脚本(支持推送)
REGISTRY=<registry地址> NAMESPACE=<命名空间> ./build-image.sh --push
```

镜像通过 GitHub Actions 自动构建并推送到阿里云 ACR,服务器以
`docker compose pull` + `docker compose up -d` 方式更新。

---

## 如何取得完整对应源码 / Source offer (AGPLv3 §13)

本服务通过网络向用户提供。依据 AGPLv3 §13,与网络服务交互的用户有权取得
本服务的完整对应源代码:

- 源码仓库:<https://github.com/ZUA-CV2023/AiNode>
- 修改记录:本文件

---

## 变更历史

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-10-19 | — | 修改 1~4、6 |
| 2026-10-20 | `v1.0.0-rc.43+092982c` | 修改 5、7;首次构建镜像并部署上线,功能实测通过 |
| 2026-10-23 | `v1.0.0-rc.43+27c1e55` | 修改 8、9;CI run #3 构建成功,已包含在当前线上版本中 |
| 2026-10-28 | `v1.0.0-rc.43+2e74e22` | 修改 10;CI run #4 构建成功,已包含在当前线上版本中 |
| 2026-10-31 | `v1.0.0-rc.43+7cfad98` | 修改 11;CI run #5 构建成功 |
| 2026-10-31 | `v1.0.0-rc.43+ce99081` | 修改 12;CI run #6 构建成功 |
| 2026-11-02 | `v1.0.0-rc.43+c438989` | 修改 13、14;CI run #7 构建成功(`4341d92` 无单独运行) |
| 2026-11-07 | `v1.0.0-rc.43+bbd9a0f` | 修改 15;CI run #8 构建成功;当前线上版本,容器 healthy |
| 2026-11-09 | 待构建 | 修改 16;CI 测试门禁,尚未 push,首次运行待验证 |
| 2026-11-19 | 待构建 | 修改 17;站内用户反馈(用户入口 + 后台管理),尚未 push |
| 2026-11-20 | 待构建 | 修改 18;后台反馈列表/详情显示用户身份,尚未 push |
