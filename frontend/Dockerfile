# SipCut frontend — development image (hot reload).
# For production you'd switch to `next build` + `next start` in a multi-stage build.
FROM node:24-alpine

WORKDIR /app

# Install dependencies first so they're cached and live in the container's own
# (Linux) node_modules — never the Windows host's, which has incompatible native
# binaries (Next SWC, Tailwind lightningcss).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
