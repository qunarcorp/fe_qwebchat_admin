## Startalk ChatAdmin
### 简介
- Startalk ChatAdmin是客服后台管理系统
- ChatAdmin依赖[后端服务](https://github.com/qunarcorp/qchat_admin_open),否则无法正常使用该系统
- 涉及技术：fekit avalon vm等
- 主要功能：客服管理、智能客服选项、服务设置等
- 如果Startalk ChatAdmin对您有所帮助或启发的话，还望给个star鼓励，我们团队会尽全力提供持续优化和支持，力求做出最优秀的企业级IM套件
- 此外，为有效、流畅体验Startalk Web，还请仔细阅读安装说明，如若遇到问题，欢迎进群咨询 [QQ群](852987381)。

### 安装
#### 本地环境要求
  - node@ >= 8.6.0   npm、git等工具
  - 安装Charles工具
  - 若需要本地开发调试，则需要先安装部署后端服务

### 项目启动
  - git clone https://github.com/qunarcorp/fe_qwebchat_admin.git
  - npm install fekit -g 全局安装fekit
  - npm install
  - npm start（fekit server）
  - 只看页面访问：
    - http://127.0.0.1/vm/page/admin/***.vm
  #### 本地调试
  - 本地项目启动：sudo fekit server
  - 生成打包映射文件：sudo fekit min
  - 调接口登录（种cookie）：http://[ip]:9090/dashboard/setLoginUser.qunar?username=lfvxuhy7378&bType=1
  - 页面访问：http://[ip]:9090/sys/manage.do?bType=1
  - Charles配置：tools -> map remote -> add
      - map from:
        - host: [ip]
        - port: 9090
        - path: /prd/scripts/admin/GMManage/index@1.0.0.js
      - map to:
        - host: 127.0.0.1
        - port: 80
        - path: /prd/scripts/admin/GMManage/index@1.0.0.js
### 项目打包部署
  - 打包：sudo fekit min
  - 将refs、prd等产出复制并粘贴到后端项目/webapp目录下
  - 或者将refs、prd等产出上传至后台服务所在的服务器目录/webapp下
### 关于项目
  - 项目使用的是 vm 模板, 打包上线后该模板放置于 java 项目中
  - 本地模拟登录链接：[IP]:[端口]/dashboard/setLoginUser.qunar?username=lfvxuhy7378&bType=1
  - 测试访问链接：[IP]:[端口]/sys/smartConsult.do?bType=1
  - 复制或者rz上传
    - sudo rz  / unzip
    - cp /prd -> /webapp/prd 
    - cp /refs -> /webapp/refs