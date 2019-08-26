### 项目启动
  - npm install fekit -g 全局安装fekit
  项目依赖于jquery,需要在项目统计目录下有jquery项目，如果没有
  - cd ../
  - git clone xxx
  需要在当前项目父级目录启动项目
  - fekit server 
  - 配置host
    # qweb_chat_dev
    127.0.0.1 test.com

### 关于项目
  - 项目使用的是 vm 模板, 打包上线后该模板放置于 java 项目中
  - beta访问链接：/sys/smartConsult.do?bType=1
  - 测试账号： admin/testpassword

### fekit_modules
### prd refs ver
- fekit server
- fekit min
- node 8.6.0  npm源
- 复制
 - cp /prd/scripts/admin  /webapp/scripts/admin  
 - cp /prd/styles/admin  /webapp/styles/admin  
 - cp /refs /webapp/refs