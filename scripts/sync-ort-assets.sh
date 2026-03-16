#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/node_modules/onnxruntime-web/dist"
DST_DIR="$ROOT_DIR/public/ort"

mkdir -p "$DST_DIR"

# Copy wasm runtime modules required by onnxruntime-web wasm backend.
cp -f "$SRC_DIR"/ort-wasm* "$DST_DIR"/

echo "Synced ONNX runtime wasm assets to $DST_DIR"
