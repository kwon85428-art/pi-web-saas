# oil-web SaaS

[pi 编程智能体](https://github.com/badlogic/pi-mono) 的多用户网页界面（SaaS 版）。

在原版 pi-web 基础上增加了：
- 🔐 邮箱注册/登录 + 微信扫码登录
- 👥 多用户 session 隔离（每人独立 workspace）
- 💳 付费订阅预留接口
- 🚀 一键部署到腾讯云

## 快速体验

```bash
npm install
npm run dev
```

打开 [http://localhost:30141](http://localhost:30141)，先注册账号再使用。

## 部署到腾讯云

**一键部署（推荐）：**

```bash
# 1. 在腾讯云服务器上克隆
git clone https://github.com/YOUR_USER/oil-web-saas.git
cd oil-web-saas

# 2. 一键部署
bash deploy.sh

# 3. 访问 http://<服务器IP>:30141

# 4. （可选）配置域名 + HTTPS
bash deploy.sh --production --domain your-domain.com
```

**生产环境额外步骤：**

```bash
# 配置微信登录
# 编辑 .env 文件，填入你的微信开放平台 AppID 和 AppSecret
vim .env
# WECHAT_APP_ID=wx_xxx
# WECHAT_APP_SECRET=xxx
# WECHAT_REDIRECT_URI=https://your-domain.com/api/auth/wechat

# HTTPS 证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 重启
pm2 restart pi-web
```

## 环境变量

| 变量 | 必需 | 说明 |
|---|---|---|
| `JWT_SECRET` | 是 | JWT 签名密钥（deploy.sh 自动生成） |
| `WECHAT_APP_ID` | 否 | 微信开放平台 AppID |
| `WECHAT_APP_SECRET` | 否 | 微信开放平台 AppSecret |
| `WECHAT_REDIRECT_URI` | 否 | 微信 OAuth 回调地址 |
| `PORT` | 否 | 默认 30141 |

## 管理命令

```bash
pm2 status          # 查看状态
pm2 logs pi-web     # 查看日志
pm2 restart pi-web  # 重启
pm2 stop pi-web     # 停止
```

## 功能

- ✅ 邮箱注册/登录
- ✅ 微信扫码登录（需配置开放平台）
- ✅ 多用户 session 隔离
- ✅ 用户菜单（头像/昵称/订阅状态/登出）
- ✅ JWT 认证中间件
- ✅ 跨会话分叉与分支
- ✅ 模型切换
- ✅ 文件浏览
- 🔜 Stripe 支付（接口已预留）
- 🔜 微信支付（接口已预留）

## 付费接入

数据库 `subscriptions` 表已就绪。接入 Stripe 只需：

```typescript
// 1. 创建 /app/api/payment/create-checkout/route.ts
// 2. 创建 /app/api/payment/webhook/route.ts
// 3. 更新 checkSubscription() 在 lib/auth.ts
```

## 项目原始

原始 pi-web 项目：[agegr/pi-web](https://github.com/agegr/pi-web)

## License

MIT
