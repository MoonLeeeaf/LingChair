# 使用官方 Deno 镜像
FROM denoland/deno:latest

# 设置镜像名称
LABEL image.name="lingchair"

# 设置工作目录
WORKDIR /app

# 复制源代码
COPY --exclude=.git --exclude=.gitignore --exclude=Dockerfile --exclude=readme.md --exclude=thewhitesilk_config.json --exclude=thewhitesilk_data . .

# 缓存依赖并构建项目
RUN npm run install-dependencies

RUN npm run build-client

# 暴露应用端口（根据你的应用调整端口号）
EXPOSE 3601

# 启动服务
CMD ["npm", "run", "server"]
