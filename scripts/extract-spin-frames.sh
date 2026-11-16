#!/usr/bin/env bash
# Usage: ./scripts/extract-spin-frames.sh /path/to/official-video.mp4 ./client/public/media/pollo-spin
# Only use with video supplied/licensed by Pollos B3. Creates ~64 WebP frames for an 8s source.
set -euo pipefail
if [ "$#" -ne 2 ]; then echo "Uso: $0 <video oficial> <directorio de salida>"; exit 1; fi
SOURCE="$1"; DEST="$2"
if [ ! -f "$SOURCE" ]; then echo "No existe el video: $SOURCE"; exit 1; fi
mkdir -p "$DEST"
ffmpeg -hide_banner -loglevel error -i "$SOURCE" -vf 'fps=8,scale=720:-2:flags=lanczos' -frames:v 64 -c:v libwebp -quality 80 "$DEST/frame-%03d.webp"
echo "Cuadros creados: $(find "$DEST" -name 'frame-*.webp' | wc -l)"
echo "Registrar las rutas públicas ordenadas de los cuadros en spinFrames[] del catálogo administrativo."
