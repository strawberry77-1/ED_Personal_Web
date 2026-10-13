#!/bin/bash
# 一键启动本地站点：许航（Edwards）个人主页
cd "$(dirname "$0")" || exit 1

PORT=8080
while lsof -i :"$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

PY=""
for c in python3 /usr/bin/python3 python; do
  if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
done

echo "==================================================="
echo "  许航（Edwards）· 个人主页"
echo "  目录：$(pwd)"
echo "==================================================="

if [ -z "$PY" ]; then
  echo "未检测到 Python，改为直接打开本地文件 index.html"
  open "index.html"
  exit 0
fi

URL="http://localhost:$PORT"
echo "服务地址：$URL"
echo "按 Control + C 停止服务"
echo ""

trap 'echo ""; echo "已停止本地服务。"; exit 0' INT TERM
( sleep 1; open "$URL" ) &
exec "$PY" -m http.server "$PORT"
