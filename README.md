# AiNode

AiNode 是一套面向团队内部与客户的中转站（API Gateway），基于开源项目
[new-api](https://github.com/QuantumNous/new-api) 构建。

---

## 来源声明 / Attribution

This project is a modified version of
[new-api](https://github.com/QuantumNous/new-api) by QuantumNous and contributors,
licensed under the GNU Affero General Public License v3.0.

- 上游版权归 **QuantumNous 及贡献者**所有。
- 本仓库仅对 [CHANGELOG-our-changes.md](CHANGELOG-our-changes.md) 中列出的修改内容负责。
- Frontend design and development by New API contributors.
- 本修改版本未歪曲软件来源。

---

## 与上游的差异

| 改动 | 说明 |
| --- | --- |
| 豆包视频渠道支持「拉取上游模型」 | `ChannelTypeDoubaoVideo`（54）与 `ChannelTypeVolcengine`（45）共用 `/api/v3/models` 分支。改动前 54 会落到 `/v1/models`，而方舟不提供该端点，固定 404 |
| 构建参数可覆盖 | `Dockerfile` 提供 `GOPROXY`、`NPM_REGISTRY` 两个 build-arg，便于国内构建，默认值保持上游行为 |
| 构建脚本增强 | `build-image.sh` 支持镜像仓库前缀与 `--push`；Docker 标签自动净化（`+` → `_`）；构建后精确还原 `VERSION` |
| 部署校验脚本 | `verify-deploy.sh` 通过 5 层证据验证线上容器确实是本次构建的产物 |

完整清单、原因与验证方式见 **[CHANGELOG-our-changes.md](CHANGELOG-our-changes.md)**。

---

## 许可证

本项目以 **GNU Affero General Public License v3.0** 发布，完整条款见 [LICENSE](LICENSE)。

上游依据 AGPLv3 **§7** 附加的合理法律声明与署名要求见 [NOTICE](NOTICE)，
**必须随代码保留，不得删除**。

### AGPLv3 §13 源码提供

通过本服务与网络交互的用户，有权获得对应的完整源代码：

- 源码仓库：<https://github.com/ZUA-CV2023/AiNode>
- 修改记录：[CHANGELOG-our-changes.md](CHANGELOG-our-changes.md)

---

## 构建

### 方式一：直接使用 Docker

```bash
# VERSION 决定 /api/status 与页面显示的版本号
# 注意：必须用 '+' 连接自定义后缀，'-' 会导致前端版本解析失败
echo 'v1.0.0-rc.43+yourbuild' > VERSION

docker build -t ainode:dev .
```

### 方式二：使用构建脚本

```bash
./build-image.sh                      # 自动生成版本号
./build-image.sh 'v1.0.0-rc.43+a1b2c3d'   # 指定版本号
```

推送到镜像仓库：

```bash
REGISTRY=registry.cn-beijing.aliyuncs.com \
NAMESPACE=ainode \
  ./build-image.sh --push
```

国内网络构建时，脚本默认使用 `goproxy.cn` 与 `registry.npmmirror.com`，
可通过环境变量覆盖：

```bash
GOPROXY=https://proxy.golang.org,direct \
NPM_REGISTRY=https://registry.npmjs.org/ \
  ./build-image.sh
```

---

## 部署

```bash
docker compose up -d
```

更新到新镜像时只重建业务容器，不动数据库：

```bash
docker compose up -d --no-deps --force-recreate new-api
```

部署后校验线上版本：

```bash
./verify-deploy.sh 'v1.0.0-rc.43+a1b2c3d'
```

---

## 第三方许可

本项目包含第三方开源软件，其版权声明与许可条款见
[THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md)。该文件需随 Docker 镜像与二进制产物一并保留。
