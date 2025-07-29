```bash
npm init -y
rm -rf package.json
pnpm init
npm install --global corepack@latest
corepack enable pnpm
corepack use pnpm@latest-10
pnpm add express dotenv
pnpm init -y
npm init -y
pnpm add express dotenv
pnpm add -D typescript ts-node @types/node @types/express nodemon eslint prettier
npx tsc --init
```
