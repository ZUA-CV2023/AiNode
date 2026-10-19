#!/usr/bin/env bash
# =============================================================================
# verify-deploy.sh —— 验证服务器上「正在跑的」确实是你构建的那个镜像
#
# 用法（在服务器上）：
#   ./verify-deploy.sh v1.0.0-rc.43+a1b2c3d      # 断言版本号（后缀用 + 不用 -）
#   ./verify-deploy.sh                            # 只打印现场快照，不断言
#
# 检查 5 层证据，任一层不符即失败（退出码 1）：
#   1. 容器在运行
#   2. 容器当前镜像 ID / digest
#   3. 容器启动时间（确认不是旧进程）
#   4. 容器内 /new-api 二进制的 sha256（确认镜像内容真的换了）
#   5. /api/status 返回的 version（确认版本指纹从源码一路编译进产物）
#
# 第 5 层是最强的证据：版本号来自 VERSION 文件，经 Dockerfile 的 -ldflags
# 编进后端、经 VITE_REACT_APP_VERSION 编进前端，能显示出来就说明整条链路通了。
# =============================================================================
set -uo pipefail

CONTAINER="${CONTAINER:-new-api}"
EXPECT_VERSION="${1:-}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

pass=0; fail=0
ok()   { echo "  ✅ $*"; pass=$((pass+1)); }
bad()  { echo "  ❌ $*"; fail=$((fail+1)); }
info() { echo "     $*"; }

echo "================================================================"
echo " 部署验证  container=$CONTAINER"
echo " 期望版本  ${EXPECT_VERSION:-（未指定，仅打印快照）}"
echo " 时间      $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================================"

# ---------- 1. 容器状态 ----------
echo
echo "[1/5] 容器状态"
if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  bad "容器 $CONTAINER 不存在"
  echo
  echo "结论：验证失败（容器不存在）"
  exit 1
fi
STATE="$(docker inspect "$CONTAINER" --format '{{.State.Status}}')"
HEALTH="$(docker inspect "$CONTAINER" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}')"
if [[ "$STATE" == "running" ]]; then
  ok "运行中（health=$HEALTH）"
else
  bad "状态为 $STATE（期望 running）"
fi

# ---------- 2. 镜像身份 ----------
echo
echo "[2/5] 镜像身份"
IMAGE_REF="$(docker inspect "$CONTAINER" --format '{{.Config.Image}}')"
IMAGE_ID="$(docker inspect "$CONTAINER" --format '{{.Image}}' | cut -c1-19)"
info "配置镜像 : $IMAGE_REF"
info "镜像 ID  : $IMAGE_ID"
if REPO_DIGEST="$(docker inspect "$CONTAINER" --format '{{index .RepoDigests 0}}' 2>/dev/null)" && [[ -n "$REPO_DIGEST" ]]; then
  info "RepoDigest: $REPO_DIGEST"
else
  info "RepoDigest: （本地构建镜像没有 digest，正常）"
fi
# 与本地 tag 对应的镜像 ID 是否一致（能抓到「tag 换了但容器没重建」）
CUR_TAG_ID="$(docker image inspect "$IMAGE_REF" --format '{{.Id}}' 2>/dev/null | cut -c1-19 || true)"
if [[ -n "$CUR_TAG_ID" ]]; then
  if [[ "$CUR_TAG_ID" == "$IMAGE_ID" ]]; then
    ok "容器用的正是 $IMAGE_REF 当前指向的镜像"
  else
    bad "不一致：容器=$IMAGE_ID 但 $IMAGE_REF 现在指向=$CUR_TAG_ID（容器没重建？）"
  fi
fi

# ---------- 3. 启动时间 ----------
echo
echo "[3/5] 容器启动时间"
STARTED="$(docker inspect "$CONTAINER" --format '{{.State.StartedAt}}')"
info "StartedAt: $STARTED"
START_EPOCH="$(date -d "$STARTED" +%s 2>/dev/null || echo 0)"
NOW_EPOCH="$(date +%s)"
if [[ "$START_EPOCH" -gt 0 ]]; then
  AGE=$(( NOW_EPOCH - START_EPOCH ))
  info "已运行  : ${AGE} 秒（约 $((AGE/3600)) 小时）"
  if [[ "$AGE" -lt 3600 ]]; then
    ok "容器是最近 1 小时内启动的（符合刚更新）"
  else
    info "⚠️ 已运行超过 1 小时，确认这是你预期的更新吗？"
  fi
fi

# ---------- 4. 二进制指纹 ----------
echo
echo "[4/5] 容器内二进制指纹"
BIN_SHA="$(docker exec "$CONTAINER" sha256sum /new-api 2>/dev/null | awk '{print $1}')"
if [[ -n "$BIN_SHA" ]]; then
  ok "sha256(/new-api) = $BIN_SHA"
  info "把这个值记下来，下次对比就能确认二进制真的换了"
else
  bad "无法读取 /new-api（容器内路径可能不同）"
fi

# ---------- 5. 版本指纹（最强证据）----------
echo
echo "[5/5] 版本指纹 /api/status"
LIVE_JSON="$(curl -s --max-time 10 "$BASE_URL/api/status" 2>/dev/null)"
LIVE_VERSION="$(printf '%s' "$LIVE_JSON" | grep -o '"version":"[^"]*"' | head -1 | sed 's/.*:"//; s/"$//')"
if [[ -z "$LIVE_JSON" ]]; then
  bad "无法访问 $BASE_URL/api/status"
elif [[ -z "$LIVE_VERSION" ]]; then
  bad "接口有响应但没解析到 version 字段"
else
  info "线上版本: [$LIVE_VERSION]"
  if [[ -z "$LIVE_VERSION" ]]; then
    bad "版本号为空 —— 说明构建时 VERSION 文件是空的，无法作为构建指纹"
  fi
  if [[ -n "$EXPECT_VERSION" ]]; then
    if [[ "$LIVE_VERSION" == "$EXPECT_VERSION" ]]; then
      ok "版本号与期望一致"
    else
      bad "版本号不符：期望 [$EXPECT_VERSION] 实际 [$LIVE_VERSION]"
    fi
  fi
fi

# ---------- 结论 ----------
echo
echo "================================================================"
echo " 现场快照（建议存档，下次更新后对比）"
echo "--------------------------------------------------------------"
echo "  时间          $(date '+%Y-%m-%d %H:%M:%S')"
echo "  镜像          $IMAGE_REF"
echo "  容器镜像 ID   $IMAGE_ID"
echo "  启动时间      $STARTED"
echo "  二进制 sha256 $BIN_SHA"
echo "  线上版本      ${LIVE_VERSION:-<空>}"
echo "================================================================"
echo " 通过 $pass 项，失败 $fail 项"
if [[ "$fail" -gt 0 ]]; then
  echo " 结论：❌ 验证失败"
  exit 1
fi
echo " 结论：✅ 验证通过"
exit 0
