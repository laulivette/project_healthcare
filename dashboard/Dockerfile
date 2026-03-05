FROM node:20-alpine

WORKDIR /app

# Copie uniquement les fichiers de dépendances d'abord (cache Docker)
COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
