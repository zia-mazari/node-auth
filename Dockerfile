FROM node:alpine
WORKDIR /opt/projects/krava-account
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "start"]