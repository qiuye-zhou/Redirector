# Redirect Wizard - 前端调试工具

一个专为前端开发者设计的Chrome浏览器插件，用于API请求重定向和调试，让前后端联调变得更加便捷高效。

## 🚀 功能特性

### ✅ 已实现功能
- **API请求重定向**: 保存目标地址后，自动将所有请求重定向到指定服务器
- **实时请求监控**: 实时显示当前页面的所有API请求信息
- **请求详情查看**: 点击请求可查看详细的请求和响应数据
- **多环境切换**: 支持保存多个API地址，快速切换不同环境
- **JSON数据展示**: 美观的JSON数据查看器，方便调试

### 🔄 待开发的功能
- [ ] 多用户登录管理
- [ ] 用户身份快速切换
- [ ] 请求过滤和搜索
- [ ] 请求历史记录
- [ ] 自定义请求头管理

## 📦 安装使用

### 开发环境安装

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd chrome-plugin
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 pnpm
   pnpm install
   ```

3. **构建插件**
   ```bash
   npm run build
   ```

4. **加载到Chrome**
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `extensions` 目录

### 使用方法

1. **配置API地址**
   - 点击浏览器工具栏中的插件图标
   - 在"API配置"中输入目标服务器地址
   - 点击"保存"按钮

2. **启用重定向**
   - 选择已保存的API地址作为当前环境
   - 插件会自动拦截页面请求并重定向

3. **查看请求信息**
   - 在"请求列表"中查看所有拦截的请求
   - 点击请求可查看详细的请求和响应数据

## 🛠️ 技术栈

- **前端框架**: React 18
- **UI组件库**: Ant Design
- **构建工具**: Webpack 5
- **CSS框架**: UnoCSS
- **浏览器API**: Chrome Extension Manifest V3
- **开发语言**: JavaScript (ES6+)

## 📁 项目结构

```
chrome-plugin/
├── public/                 # 构建输出目录
├── src/                    # 源代码
│   ├── components/         # React组件
│   │   ├── ApiConfig/      # API配置组件
│   │   ├── RequestList/    # 请求列表组件
│   │   ├── JsonViewer/     # JSON查看器
│   │   └── FloatingWindow/ # 浮动窗口
│   ├── context/            # React Context
│   ├── hooks/              # 自定义Hooks
│   ├── services/           # 服务层
│   ├── utils/              # 工具函数
│   ├── background.js       # 后台脚本
│   ├── content.js          # 内容脚本
│   └── manifest.js         # 插件清单
├── scripts/                # 构建脚本
└── webpack.config.js       # Webpack配置
```

## 🔧 开发指南

### 开发模式
```bash
# 监听文件变化并自动构建
npm run watch
```

### 构建生产版本
```bash
# 构建生产版本
npm run build
```

### 主要组件说明

- **ApiConfig**: 管理API地址配置，支持多环境切换
- **RequestList**: 显示拦截的请求列表，支持详情查看
- **JsonViewer**: 格式化显示JSON数据
- **FloatingWindow**: 提供浮动窗口功能

## 🔒 权限说明

插件需要以下权限：
- `storage`: 存储配置信息
- `webRequest`: 拦截网络请求
- `declarativeNetRequest`: 声明式网络请求重定向
- `tabs`: 访问标签页信息
- `scripting`: 注入脚本
- `<all_urls>`: 访问所有网站

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 问题反馈

如果您在使用过程中遇到问题或有功能建议，请通过以下方式联系：

- 提交 [Issue](../../issues)

---
