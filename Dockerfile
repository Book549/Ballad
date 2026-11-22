# Ballad Discord Bot - Dockerfile (Podman / Docker)
#
# The image provides Node + native libraries + a start script.
# Your project folder is mounted at /var (the working directory), so code,
# config, decks and bot data all stay in your folder.
#
#   podman build -t ballad-bot -f Dockerfile .
#   podman run -d --name ballad-bot -v ./:/var:Z ballad-bot
#
# Run from the project root (the folder containing bot/, node-common/, config/).

FROM docker.io/library/node:24.12.0-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential python3 \
      libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
      ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# Start script: on first start it (re)installs dependencies INSIDE the container
# (any node_modules built on the host is replaced, because its native parts
# won't work here), builds the dictionary database, then launches the bot.
RUN printf '%s\n' \
      '#!/bin/sh' \
      'set -e' \
      'for d in /var/node-common /var/bot; do' \
      '  cd "$d"' \
      '  if [ ! -f node_modules/.container-built ]; then' \
      '    rm -rf node_modules' \
      '    npm ci || npm install' \
      '    touch node_modules/.container-built' \
      '  fi' \
      'done' \
      'cd /var/bot' \
      '[ -f generated/resources.dat ] || npm run buildresources' \
      'exec npm start' \
      > /usr/local/bin/start-bot \
 && chmod +x /usr/local/bin/start-bot

ENV FORCE_COLOR=1 \
    MONGO_HOST=127.0.0.1:27017

WORKDIR /var
CMD ["start-bot"]
