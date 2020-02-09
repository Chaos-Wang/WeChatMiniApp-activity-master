# WeChatMiniApp-activity-master
## 微信小程序大赛，活动小总管

### 部署指南

1. 通过 SSH 连接上云服务器，直接使用包管理工具 yum 安装 Nginx：
    `yum -y install nginx`
    
2. 安装完成之后会显示 Complete!，可以通过如下命令检查 Nginx 是否安装成功：
       `nginx -v`
    这个命令会显示 Nginx 的版本号

3. 安装 Node.js
    (1) 切换源
        `curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -`
    (2) 接着就可以直接通过 yum 安装了：
        `yum -y install nodejs`
    (3) 同理，我们可以通过如下命令验证 Node.js 是否安装成功：
        `node -v`
        
        该命令会返回当前 Node.js 的版本号
        
4. 配置 Nginx 和 HTTPS
    如果访问 http://你的域名/weapp/a 会自动跳转到 HTTPS 上，并显示 502 Bad Gateway，则表示配置成功：

5. 克隆代码到本地，修改 server/config.js：

```
const CONF = {
    port: '5759',
    rootPathname: '',

    // 微信小程序 App ID
    appId: '',

    // 微信小程序 App Secret
    appSecret: '',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: '云数据库内网IP',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: '云数据库密码',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 区域
         * @see https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
  
    // 其他配置 ...
    serverHost: '你的域名',
    tunnelServerUrl: 'https://tunnel.ws.qcloud.la',
    tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
  	// 腾讯云相关配置可以查看云 API 秘钥控制台：https://console.qcloud.com/capi
    qcloudAppId: '你的腾讯云 AppID',
    qcloudSecretId: '你的腾讯云 SecretId',
    qcloudSecretKey: '你的腾讯云 SecretKey',
    wxMessageToken: 'weixinmsgtoken',
    networkTimeout: 30000
}

module.exports = CONF
```
详细配置细节见 ./API.md

6. 接着将 server 目录下的所有文件都上传到 /weapp 目录下
7. 使用 SSH 切换到代码目录：

8. 更换 npm 源到腾讯云镜像，防止官方镜像下载失败：
    `npm config set registry http://mirrors.tencentyun.com/npm/`
    
9. 接着安装全局依赖：
    `npm install -g pm2`
    
10. 然后安装本地依赖：
    `npm install`
    
11. 新建数据库，使用config中填写的数据库名，排序规则为 utf8mb4_unicode_ci

12. 返回 SSH，使用 Demo 代码里的 tools/initdb.js 工具初始化数据库：
    `node tools/initdb.js`
初始化成功则会提示“数据库初始化成功！”

13. 运行程序：
    `node app.js`
    
14. 将client目录导入微信开发者工具

直接访问 http://你的域名/login，会提示：
```
{"code":-1,"error":"ERR_HEADER_MISSED"}
```
则表示配置成功。你现在可以使用开发者工具来进行联调测试啦！

### 相关文档
1. [Wafer-Node 服务端文档](https://github.com/tencentyun/wafer2-startup/wiki)
