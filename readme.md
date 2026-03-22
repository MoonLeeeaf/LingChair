<div align="center">
  <h1> 铃之椅 </h1>
</div>

***由于项目架构的复杂性, 考虑重新开发中......***

<br>

铃之椅, 一个普通的即时通讯项目——简单, 轻量, 纯粹, 时而天真

***仍在开发阶段, 随时都可能有破坏性变更!***

### 目前的功能

<details>
  <summary>新客户端</summary>

*: 重构中

- 消息
  - [ ] *收发消息 
  - [x] 富文本
  - [ ] 撤回消息
  - [ ] 修改消息

- 对话
  - [x] 最近对话
  - [x] 添加收藏对话
    - [x] 添加用户
    - [x] 添加群组
  - [ ] *群组管理

- 帐号
  - [x] 登录注册
  - [x] 资料编辑
    - [x] 用户名
    - [x] 昵称
    - [x] 头像
  - [ ] 帐号管理
    - [ ] 重设密码
    - [ ] 绑定邮箱

</details>

<details>
  <summary>服务端</summary>

- 基本对话类型
  - [x] 私聊
  - [x] 群组

- 消息
  - [x] 收发消息
  - [ ] 撤回消息
  - [ ] 修改消息

- 对话
  - [x] 最近对话
  - [x] 添加对话

- 帐号
  - [x] 登录注册
  - [x] 资料编辑
  - [ ] 帐号管理
    - [x] 重设密码 (不够好!)
    - [ ] 绑定邮箱

</details>

### 部署

```bash
git clone https://codeberg.org/CrescentLeaf/LingChair
cd LingChair
npm run install-dependencies
npm run build-client
npm run server
```

#### 配置

thewhitesilk_config.json [请见此处](./server/config.ts)

### 使用到的项目 / 库

由于 Deno 存在的严重问题, 已重新迁移到 Node.js

- 客户端协议
  - crypto-browserify

- 前端
  - 编译
    - vite
  - react
  - socket.io-client
  - mdui
  - split.js
  - ua-parser-js
  - pinch-zoom
  - use-context-selector
  - dompurify
  - marked

- 后端
  - express
  - express-fileupload
  - socket.io
  - chalk
  - file-type
  - cookie-parser

### License

[MIT License](./license)
