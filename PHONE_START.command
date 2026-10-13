#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f package.json ]; then
  echo "이 파일은 bloom-3 폴더 안에서 실행해야 합니다."
  echo "PHONE_START.command를 bloom-3 최상단으로 복사한 뒤 다시 실행하세요."
  read -n 1
  exit 1
fi
npm run dev -- --host 0.0.0.0
