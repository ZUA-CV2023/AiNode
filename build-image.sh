#!/usr/bin/env bash
# =============================================================================
# build-image.sh —— 在源码根目录构建带「版本指纹」的 new-api 镜像
#
# 用法：
#   ./build-image.sh                          # 自动从 git / 时间戳生成版本号
#   ./build-image.sh 'v1.0.0-rc.43+ainode.1'   # 手动指定版本号（后缀用 + 不用 -）
#   REGISTRY=registry.cn-beijing.aliyuncs.com NAMESPACE=ainode \
#     ./build-image.sh --push                  # 构建并推送到镜像仓库
#
# 为什么必须有版本号：
#   Dockerfile 里有两行把 VERSION 文件的内容编译进产物：
#     -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'   ← 后端二进制
#     VITE_REACT_APP_VERSION=$(cat /build/VERSION)                          ← 前端页面
#   所以这个版本号会出现在 /api/status 和页面上，
#   是「这个镜像到底是哪次构建」的唯一端到端证据。
#
# ⚠️ 仓库自带的 VERSION 文件是空的！不写内容就构建，版本号会是空字符串，
#    你就无法区分「改过的镜像」和「没改过的镜像」。
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")"

# ---------- 前置检查 ----------
if [[ ! -f Dockerfile ]]; then
  echo "❌ 当前目录没有 Dockerfile，请在 new-api 源码根目录运行" >&2
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ 没有 docker 命令。请先安装 Docker Desktop" >&2
  exit 1
fi

# ---------- 计算版本号 ----------
BASE_VERSION="$(cat VERSION 2>/dev/null | tr -d '[:space:]' || true)"
[[ -z "$BASE_VERSION" ]] && BASE_VERSION="v1.0.0-rc.43"

# ⚠️ 版本号格式必须能被前端解析器识别，否则「关于/更新」那块会显示异常。
#    项目里的正则是：
#      ^v?(\d+(?:\.\d+){2,})(?:-(alpha|beta|rc|patch)(?:\.(\d+))?(?:-i18nfix\.(\d+))?)?(?:\+[\da-zA-Z.-]+)?$
#    实测结论（已用该正则逐条验证）：
#      v1.0.0-rc.43+shw.1        ✅ 能识别（+ 后面是 build metadata）
#      v1.0.0-rc.43+a1b2c3d      ✅
#      v1.0.0-rc.43-shw.1        ❌ 不能识别
#      v1.0.0-rc.43-a1b2c3d      ❌ 不能识别
#    原因："-" 后面只允许 alpha/beta/rc/patch 这几种预设词。
#    所以自定义后缀一律用 "+"，绝不要用 "-"。
# ---------- 参数 ----------
# 位置参数 = 版本号；--push = 构建完成后推送到镜像仓库
PUSH=0
VERSION_ARG=""
for a in "$@"; do
  case "$a" in
    --push) PUSH=1 ;;
    *) VERSION_ARG="$a" ;;
  esac
done

if [[ -n "$VERSION_ARG" ]]; then
  NEW_VERSION="$VERSION_ARG"
elif [[ -d .git ]]; then
  SHORT_SHA="$(git rev-parse --short HEAD)"
  DIRTY=""
  if [[ -n "$(git status --porcelain)" ]]; then DIRTY=".dirty"; fi
  NEW_VERSION="${BASE_VERSION}+${SHORT_SHA}${DIRTY}"
else
  NEW_VERSION="${BASE_VERSION}+$(date -u +%Y%m%d%H%M%S)"
  echo "⚠️ 没有 .git，改用时间戳生成版本号"
fi

# 构建前自检：版本号必须能被前端解析，否则后面「验证」那一步就没意义了
if ! printf '%s' "$NEW_VERSION" | grep -Eq '^v?[0-9]+(\.[0-9]+){2,}(-(alpha|beta|rc|patch)(\.[0-9]+)?(-i18nfix\.[0-9]+)?)?(\+[0-9a-zA-Z.-]+)?$'; then
  echo "❌ 版本号 [$NEW_VERSION] 不符合前端解析规则，会导致版本显示异常。" >&2
  echo "   请改用 v1.0.0-rc.43+自定义后缀 这种形式（后缀用 + 不用 -）。" >&2
  exit 1
fi

# ---------- 镜像命名 ----------
# 不设 REGISTRY = 纯本地镜像（例：new-api:v1.0.0-rc.43_abc1234）
# 设了 REGISTRY/NAMESPACE = 可直接推送的完整地址
#   例：REGISTRY=registry.cn-beijing.aliyuncs.com NAMESPACE=ainode
#       → registry.cn-beijing.aliyuncs.com/ainode/new-api:v1.0.0-rc.43_abc1234
REGISTRY="${REGISTRY:-}"
NAMESPACE="${NAMESPACE:-}"
IMAGE_NAME="${IMAGE_NAME:-new-api}"
# ⚠️ Docker 标签只允许 [a-zA-Z0-9._-]，'+' 是非法字符，会报
#    "invalid reference format"。而 VERSION 文件里的版本号为了前端能解析
#    必须用 '+'。所以两处用两套字符串：VERSION 保留 '+'，镜像标签换成 '_'。
IMAGE_TAG="${IMAGE_TAG:-${NEW_VERSION//+/_}}"

PREFIX=""
if [[ -n "$REGISTRY" ]]; then PREFIX="${REGISTRY}/"; fi
if [[ -n "$NAMESPACE" ]]; then PREFIX="${PREFIX}${NAMESPACE}/"; fi
FULL_NAME="${PREFIX}${IMAGE_NAME}:${IMAGE_TAG}"

# 国内加速：可用环境变量覆盖；显式传空串则走上游默认源
GO_PROXY="${GOPROXY:-https://goproxy.cn,direct}"
NPM_PROXY="${NPM_REGISTRY:-https://registry.npmmirror.com}"

echo "=============================================================="
echo " 版本号     : $NEW_VERSION"
echo " 镜像标签   : $FULL_NAME"
echo " GOPROXY    : $GO_PROXY"
echo " NPM 源     : $NPM_PROXY"
echo " 构建后推送 : $([[ "$PUSH" -eq 1 ]] && echo 是 || echo 否)"
echo "=============================================================="

# ---------- 写入 VERSION（构建后再还原） ----------
# 必须还原「原始字节」而不是 $BASE_VERSION：仓库里的 VERSION 是 0 字节，
# 若还原成默认版本号，每次构建后 git status 都会显示 VERSION 被修改，
# 团队协作时工作区会一直被这点噪音污染。
ORIG_VERSION_RAW="$(cat VERSION 2>/dev/null || true)"
printf '%s' "$NEW_VERSION" > VERSION
restore_version() { printf '%s' "$ORIG_VERSION_RAW" > VERSION; }
trap restore_version EXIT

# ---------- 构建 ----------
echo "▶ 开始构建（首次会比较慢，之后有缓存）..."
docker build \
  --build-arg GOPROXY="$GO_PROXY" \
  --build-arg NPM_REGISTRY="$NPM_PROXY" \
  -t "$FULL_NAME" .

# ---------- 构建结果 ----------
IMAGE_ID="$(docker image inspect "$FULL_NAME" --format '{{.Id}}')"
echo
echo "✅ 构建完成"
echo "  镜像名   : $FULL_NAME"
echo "  镜像 ID  : $IMAGE_ID"
echo "  版本指纹 : $NEW_VERSION"
echo
echo "▶ 推送"
if [[ "$PUSH" -eq 1 ]]; then
  if [[ -z "$REGISTRY" ]]; then
    echo "❌ --push 需要先设置 REGISTRY，例如：" >&2
    echo "   REGISTRY=registry.cn-beijing.aliyuncs.com NAMESPACE=ainode ./build-image.sh --push" >&2
    exit 1
  fi
  # 未登录时先 docker login，否则 push 会 401
  docker push "$FULL_NAME"
  echo
  echo "✅ 已推送：$FULL_NAME"
else
  echo "   本次未推送。要推送请加 --push，并设置 REGISTRY/NAMESPACE："
  echo "   REGISTRY=registry.cn-beijing.aliyuncs.com NAMESPACE=ainode ./build-image.sh $NEW_VERSION --push"
  echo
  echo "   或手动："
  echo "   docker tag  $FULL_NAME  <仓库>/<命名空间>/new-api:$IMAGE_TAG"
  echo "   docker push <仓库>/<命名空间>/new-api:$IMAGE_TAG"
fi
echo
echo "▶ 服务器上拉到新镜像后，用期望版本号验证："
echo "    bash verify-deploy.sh $NEW_VERSION"
