# Redirector - Chrome 浏览器插件

一个专为前端开发者设计的Chrome浏览器插件，用于API请求重定向和调试，让前后端联调变得更加便捷高效。

## 项目结构

```
Redirector/
├── src/                          # 源代码目录
│   ├── components/               # React 组件
│   │   ├── ApiConfig/           # API 配置组件
│   │   ├── FloatingWindow/      # 浮动窗口组件
│   │   ├── JsonViewer/          # JSON 查看器组件
│   │   ├── Popup/               # 弹窗组件 (新增)
│   │   ├── RequestList/         # 请求列表组件
│   │   └── Sidebar/             # 侧边栏组件
│   ├── context/                 # React Context
│   ├── hooks/                   # 自定义 Hooks
│   ├── popup.jsx                # 弹窗入口文件 (新增)
│   ├── popup.html               # 弹窗 HTML 模板 (新增)
│   ├── content.js               # 内容脚本
│   ├── background.js            # 后台脚本
│   └── manifest.js              # 清单文件生成器
├── public/                      # 静态资源
│   ├── content.css              # 内容脚本样式
│   └── images/                  # 图标资源
├── scripts/                     # 构建脚本
├── webpack.config.js            # Webpack 配置
└── package.json                 # 项目配置
```

## 主要功能

- **API 请求重定向**: 将本地开发环境的 API 请求重定向到指定的服务器
- **请求拦截和修改**: 拦截网络请求，支持修改请求头和请求体
- **响应数据查看**: 实时查看 API 响应数据
- **浮动配置窗口**: 在页面上显示可拖拽的配置窗口
- **弹窗管理界面**: 通过浏览器插件弹窗管理配置

## 开发指南

### 安装依赖

```bash
npm install
# 或者
pnpm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 清理构建文件

```bash
npm run clean
```

## 技术栈

- **前端框架**: React 18
- **构建工具**: Webpack 5
- **样式方案**: UnoCSS
- **浏览器 API**: Chrome Extension Manifest V3
- **代码质量**: ESLint + Prettier

## 组件说明

### Popup 组件
- 位置: `src/components/Popup/`
- 功能: 浏览器插件弹窗界面，显示插件状态和配置信息
- 特性: 实时状态检查、Service Worker 监控、存储信息展示

### FloatingWindow 组件
- 位置: `src/components/FloatingWindow/`
- 功能: 页面上的浮动配置窗口，支持拖拽
- 特性: 可拖拽、多标签页、响应式设计

### ApiConfig 组件
- 位置: `src/components/ApiConfig/`
- 功能: API 配置管理
- 特性: 配置保存、规则管理、实时生效

## 构建配置

项目使用 Webpack 5 进行构建，主要配置包括：

- **多入口点**: content.js、background.js、popup.jsx
- **代码分割**: 针对不同入口点优化打包策略
- **资源复制**: 自动复制必要的静态资源
- **样式处理**: 支持 CSS 和 UnoCSS

## 浏览器兼容性

- Chrome 58+
- 支持 Manifest V3
- 现代 ES6+ 语法

## 许可证

MIT License
