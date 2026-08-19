# trajectory-clean

简洁直观的轨迹视图插件 for DeepSeek Harness。

## 功能

- 在会话顶部添加 **"轨迹"** 标签页，与原版"聊天"并列
- 按**用户消息**分组，标题显示你的输入内容，一眼定位
- 每条消息显示**类型标签**（用户/模型/工具/命令/错误等）
- 显示 **Token 消耗**：输入、输出、缓存命中（chip 标签样式）
- 点击展开**详情**：文本、思考过程、工具参数与结果、Token 详情、模型名称、首 Token 延迟
- 顶部**概览栏**：总记录数、轮次、输入/输出 Token、缓存、错误、工具调用
- 展开全部/折叠全部
- **适配所有主题**：使用 `--dsw-alias-*` CSS 变量，深海女仆皮肤等均可正常显示
- 无 emoji，无装饰性 AI 元素，干净的工具风格

## 安装方式

### 方式一：作为本地包安装

1. 将整个 `trajectory-clean` 目录复制到你的项目目录
2. 在 web profile 的 `package.json` 的 `dsh.profile.bundles` 中添加 `"trajectory-clean"`：
   ```json
   {
     "dsh": {
       "profile": {
         "bundles": [
           "@deepseek-ai/dsh-base",
           "@deepseek-ai/dsh-web-app",
           "trajectory-clean"
         ]
       }
     }
   }
   ```
3. 重启 `dsh web` 或刷新页面

### 方式二：发布到 npm / GitHub

1. 发布到 npm：
   ```bash
   npm publish
   ```
2. 或其他用户安装：
   ```bash
   npm install trajectory-clean
   ```
3. 在 web profile 的 `package.json` 中添加依赖和 bundle

### 方式三：作为 dshmarket 包

1. 按照 dshmarket 规范打包
2. 发布到 dshmarket 仓库
3. 其他用户通过 dshmarket 安装

## 文件结构

```
trajectory-clean/
├── package.json        # 包配置，声明 bundle patch
├── cordis.patch.yml    # Cordis 注册规则
├── lib/
│   ├── index.js        # Host 端入口（空）
│   └── client.js       # Client 端插件代码
└── README.md
```

## 依赖

- `@deepseek-ai/dsh-client-ui-conversation` — 提供 `conversation.view` 插槽
- `@deepseek-ai/dsh-client-ui-trajectory` — 提供 `snap.views.get('trajectory')` 数据源
- 运行时自动通过 `useSession` 读取会话快照

## 许可

MIT