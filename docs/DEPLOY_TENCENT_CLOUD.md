# 腾讯云轻量服务器 (1C2G) 部署指南

由于 1核2G (1 Core CPU, 2GB RAM) 的配置对于 Next.js 应用来说属于**极限运行**环境，特别是涉及到图片生成和中文字体处理，为了保证服务稳定，**请务必按照以下步骤操作**。

## 核心风险与对策

| 风险点 | 现象 | 解决方案 |
|---|---|---|
| **内存不足** | `npm run build` 过程中服务器卡死或报错 `Killed` | **本地构建，上传产物** 或 **开启 Swap** |
| **运行时崩溃** | 并发生成图片时，Node 进程被杀 | **开启 Swap** (保底) + **字体缓存优化** (已代码实现) |

---

## 第一步：环境初始化 (服务器端)

登录你的腾讯云服务器终端，执行以下操作。

### 1. 开启 Swap (虚拟内存) —— **必须执行**
2GB 物理内存不够用，必须划分一块磁盘空间充当内存。建议开启 4GB Swap。

```bash
# 检查当前 Swap
free -h

# 如果 Swap 为 0，执行以下命令创建 4GB Swap 文件
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 设置开机自动挂载
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 再次确认
free -h
# 此时应该看到 Swap 行有 4.0G
```

### 2. 安装 Node.js (v18 或 v20)

推荐使用 `fnm` 或 `nvm` 安装，或者直接用源安装。

```bash
# 使用 Ubuntu/Debian 示例
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node -v
npm -v
```

### 3. 安装 PM2 (进程管理器)

```bash
sudo npm install -g pm2
```

---

## 第二步：构建与部署 (推荐方案)

**强烈建议在本地电脑进行构建，然后将构建好的文件上传到服务器。** 这样可以避免在弱鸡服务器上进行高负载的编译工作。

### 1. 本地构建 (你的电脑)

在项目根目录下运行：

```bash
npm install
npm run build
```

构建成功后，你会得到一个 `.next` 文件夹。

### 2. 上传文件

你需要上传以下文件/文件夹到服务器的 `/www/name_concealed_poem` (或其他目录)：

*   `.next/` (构建产物)
*   `public/` (静态资源，字体、图片等)
*   `package.json`
*   `next.config.mjs` (如果有)
*   `.env` (环境变量文件，不要上传本地的 .env.local，在服务器新建或上传生产配置)

**排除文件 (不要上传)**：
*   `node_modules/` (太大且系统不兼容，服务器上重装)
*   `.git/`
*   `src/`, `pages/` (源码不需要，除非你不用 standalone 模式且非要源码) -> *其实 Next.js 默认运行需要源码，除非开启 standalone 模式。简单起见，除了 node_modules 和 .git，其他都传上去也没事。*

**推荐使用 SCP 或 SFTP 工具 (如 FileZilla) 上传。**

### 3. 服务器端安装依赖

进入你上传的目录：

```bash
cd /www/name_concealed_poem

# 安装生产环境依赖 (不安装 devDependencies，省空间)
npm install --production
```

---

## 第三步：启动服务

使用 PM2 启动服务，这样即使程序崩溃也会自动重启。

```bash
# 启动 Next.js
pm2 start npm --name "poem-app" -- start

# 或者指定端口 (例如 3000)
pm2 start npm --name "poem-app" -- start -- -p 3000

# 保存当前进程列表，开机自启
pm2 save
pm2 startup
```

## 第四步：Nginx 反向代理 (可选但推荐)

如果你有域名，建议使用 Nginx 反代到 3000 端口，并配置 HTTPS。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
