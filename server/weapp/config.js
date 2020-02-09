const CONF = {
    port: '5759',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wxa9f18ce7142388ca',

    // 微信小程序 App Secret
    appSecret: '38879ce7a8991c2bc4d64279d81a1195',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: false,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: '172.16.0.16',
        port: 3306,
        user: 'root',
        db: 'Bill_AC',
        pass: 'w1549346071',
        char: 'utf8mb4'
    },

   cos: {
        /**
         * 区域
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-shanghai',
        // Bucket 名称
        fileBucket: 'wxxcx-1255465043',
        // 文件夹
        uploadFolder: './Pic_Share'
    },
   	serverHost: 'https://www.wxxcx.chaoswang.cn',
    tunnelServerUrl: 'http://tunnel.ws.qcloud.la',
    tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
    qcloudAppId: '1255465043',
  	// 腾讯云相关配置可以查看云 API 秘钥控制台：https://console.cloud.tencent.com/capi
    qcloudSecretId: 'AKIDDHEi2CIYRBk6D6wStERTM2GLS8ex70ia',
    qcloudSecretKey: 'TlsrfLg1BE9tW8d1a4NrhQ9nMkycCxQs',
    wxMessageToken: 'weixinmsgtoken',
    networkTimeout: 30000,

    // 微信登录态有效期
    wxLoginExpires: 7200
}

module.exports = process.env.NODE_ENV === 'local' ? Object.assign({}, CONF, require('./config.local')) : CONF;
