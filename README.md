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
### 项目启动
  - git clone https://github.com/qunarcorp/fe_qwebchat_admin.git
  - npm install fekit -g 全局安装fekit
  - npm install
  - npm start（fekit server）
  - 访问：
    - http://127.0.0.1/vm/page/admin/***.vm
  - 配置host--或者其他跨域解决方式，以便接口测试访问
    127.0.0.1 test.com
### 项目打包部署
  - 打包：sudo fekit min
  - 将refs、prd等产出复制并粘贴到后端项目/webapp目录下
### 关于项目
  - 项目使用的是 vm 模板, 打包上线后该模板放置于 java 项目中
  - 本地模拟登录链接：[IP]:[端口]/dashboard/setLoginUser.qunar?username=lfvxuhy7378&bType=1
  - 测试访问链接：[IP]:[端口]/sys/smartConsult.do?bType=1
  - 复制
    - cp /prd  /webapp/prd 
    - cp /refs /webapp/refs