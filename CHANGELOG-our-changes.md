# 我们的修改记录 / Modifications Notice

本项目是 [new-api](https://github.com/QuantumNous/new-api) 的修改版本。
This is a modified version of new-api.

- 上游版本 / Upstream: `v1.0.0-rc.43`
- 上游许可 / License: GNU AGPL v3.0(含 NOTICE 中的 §7 附加条款)
- 本修改方 / Modified by: AiNode

依据 AGPLv3 §7(c),本文件记录我们对上游代码的所有修改。
Per AGPLv3 §7(c), every change we make to the upstream source is recorded here.

---

## 修改 1:豆包视频渠道支持「拉取上游模型」

**日期 / Date**: 2026-10-19

**文件 / File**: `controller/channel_upstream_update.go`

**位置 / Location**: `fetchChannelUpstreamModelIDs()` 内的 URL 分支,约第 421 行

**改前 / Before**

```go
case constant.ChannelTypeVolcEngine:
```

**改后 / After**

```go
// Modified by AiNode fork (AGPLv3 §7(c)): Doubao Video (54) talks to the same
// Ark base URL as VolcEngine (45) and exposes the same /api/v3/models
// endpoint, so it joins this branch instead of falling through to the
// /v1/models default below, which Ark does not serve (404).
case constant.ChannelTypeVolcEngine, constant.ChannelTypeDoubaoVideo:
```

**原因 / Reason**

`ChannelTypeDoubaoVideo`(54)与 `ChannelTypeVolcEngine`(45)使用同一个方舟基础地址
`https://ark.cn-beijing.volces.com`,模型列表端点同为 `/api/v3/models`。

改动前,54 会落到 `default` 分支拼接出 `{base}/v1/models`,而方舟不提供该端点,
导致「拉取模型」固定 404 失败。改动后两者共用同一分支。

**影响范围 / Impact**

- 仅后端逻辑。前端无需改动。
- 不影响请求转发、计费、任务执行等既有路径。
- 影响功能:「拉取模型 / Fetch Models」按钮对豆包视频渠道生效。

**验证方式 / How verified**

部署后进入 后台 → 渠道 → 豆包渠道 → 更多 → 拉取模型(Fetch Models)。
应返回该账号在方舟可用的模型列表;若返回 401/403 则说明密钥或权限问题,
若返回 404 则说明端点假设不成立,需回退本修改。

---

## 未修改但需要保留的上游内容 / Preserved upstream notices

以下内容按上游 NOTICE 的 §7 附加条款要求**保留,不得删除**:

- `NOTICE`、`LICENSE`、`THIRD-PARTY-LICENSES.md` 原样保留
- 各源文件头部的 `Copyright (C) 2023-2026 QuantumNous` 及 AGPL 声明
- 前端页脚的项目署名 `Frontend design and development by New API contributors.`
  及指向 https://github.com/QuantumNous/new-api 的可见链接
- 关于页的来源声明(One API / QuantumNous / JustSong)

本修改版本不得歪曲软件来源。上游署名归 QuantumNous 及贡献者所有,
本修改方仅对本文件列出的修改内容负责。

## 如何构建本修改版本 / Build

```bash
# 在源码根目录(new-api-1.0.0-rc.43/)执行
echo "v1.0.0-rc.43+ainode.1" > VERSION
docker build -t ainode/new-api:v1.0.0-rc.43+ainode.1 .
```

## 如何取得完整对应源码 / Source offer (AGPLv3 §13)

本服务通过网络向用户提供,依据 AGPLv3 §13,用户有权取得本服务的完整对应源码。
源码获取地址:<在此填写你们的代码仓库地址>
