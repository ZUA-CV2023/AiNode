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
| 2026-10-20 | 待部署 | 修改 8、9;补齐变更记录,替换品牌资源(AiNode 标志与静态标题) |
