FROM node:16-slim

RUN mkdir -p /data/zdxf
COPY ./package*.json .
RUN npm install

# 部署 web
WORKDIR /data/zdxf
# copy 代码
COPY . ./

# 开发容器端口
EXPOSE 3001

# 启动web服务
CMD ["npm", "start"]
