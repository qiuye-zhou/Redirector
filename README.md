# Redirector

一个 Chrome 扩展，用于重定向 API 请求到指定的服务器地址。

## 功能特性

- 支持正则表达式配置代理规则
- 实时重定向 API 请求
- 请求历史记录查看
- 可配置的 API 地址管理

## 安装说明

1. 克隆仓库
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建扩展
4. 在 Chrome 中加载 `extensions` 目录作为扩展

## 使用方法

1. 在扩展弹窗中设置 API 地址（如：`http://localhost:8080`）
2. 配置代理规则（默认支持 localhost 和 127.0.0.1）
3. 访问匹配规则的页面，API 请求将被重定向

## 技术栈

- React 18
- Chrome Extension APIs
- Webpack 5
- UnoCSS

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件