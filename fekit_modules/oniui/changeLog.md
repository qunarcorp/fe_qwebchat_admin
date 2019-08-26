
avalon.oniui
============

oniui组件库modules版本

# 0.0.1

提供datepicker，notice，dialog，textbox组件

# 0.0.2

fix textbox bug

# 0.0.3

fix style bug

# 0.0.4

delete .string

# 0.1.0

在index中增加项目中需要用到的文件

# 0.1.1

fix dropdown设置label的问题

# 0.1.2

fix avalon.getModel对于外层绑定得影响

# 0.1.3

升级avalon.textbox，修复include－src绑定相关bug

# 0.1.4

组件bug修复

# 0.1.5

升级simplegrid

# 0.1.6

增加switchdropdown 

# 0.1.7

修正doubleselect相关问题

# 0.1.8

修正simplegrid自适应宽度问题

# 0.1.9

修正doublelist相关问题

# 0.1.10

修正doublelist相关问题

# 0.1.11

修正scrollbar相关问题
修正pager样式

# 0.1.12

修正pager对于onJump的支持
simplegrid的pager栏增加样式支持

# 0.1.13

修正pager bug

# 0.1.14

优化datepicker

# 0.1.15

修正dialog bug

# 0.1.16

修正simplegrid对checkbox的支持
修正dialog的显示问题

# 0.1.17

修正daterangepicker时间范围选择逻辑
为datepicker增加移动端月份、年份选择的支持

# 0.1.18

修正pager组件在加载时插值表达式暴露的问题
修正dialog组件外部给html和body设置overflow后组件内部设置无效问题

# 0.1.19

修正pager组件在加载时插值表达式暴露的问题

# 0.1.20

修正simplegrid组件选择perPages后pager组件和simplegrid数据显示不同步问题
修正dropdown在条目较少的情况下的显示问题

# 0.1.21

修正textbox和dropdown获得焦点时样式问题

# 0.1.22

修正组件作为ms-include-src模板中的元素绑定时循环渲染的问题

# 0.2.0

升级oniui依赖的avalon

# 0.2.1

修正pager与ui规范不一致问题以及daterangepicker逻辑
修正pager组件“上一页”显示逻辑问题

# 0.2.2
为textbox添加autoFocus配置项，默认为false，如果希望用户鼠标移到textbox就focus textbox，设置此选项为true即可

# 0.2.3

修正scroll设置内容宽度的bug
修正switchdropdown的语法错误
修正dropdown multiple模式下的显示问题

# 0.2.4
添加smartgrid，修正simplegrid保持与ui样式一致
smartgrid与grid adapter功能基本保持一致，最大的特点是静态模板，建议以后grid adapter用smartgrid代替

# 0.2.5
为smartgrid添加addRow配置接口，使用户可以添加新行，avalon.smartgrid.ex7.html是使用实例
更新avalon至1.3.6

# 0.2.6
为smartgrid渲染单元格的方法增强参数
修改表格有数据disabled时的全选|不选逻辑
修正simplegrid自动滚动到顶部的逻辑
修正smartgrid初始data为空时配置pager出错的问题
修正dialog的content配置问题
設置button自scan
avalon添加data-include-replace輔助指令
fix checkbox data的元素value值为Number时全选出错的问题
fix smartgrid 在data为空时setColumns报错问题
为spinner添加动态修改min、max的功能
允许checkboxlist延迟配置data
为textbox suggest的onChange回调更新参数
更新dublelist的button类
为textbox添加getTemplate
fixed textbox IE8 bug

# 0.2.7
将组件名ui-改为oni-
为notice添加动画
为dropdown添加状态保持功能
fix dropdown保持功能对switchdropdown的input label的影响
fix tooltip动画性能问题
fix notice动画高度计算bug
为textbox增加oni-textbox-error类，并使textbox placeholder平稳退化
update validation getMessage的解析逻辑 并 优化tooltip的性能问题
调整notice的动画计算逻辑
调整textbox、checkboxlist的样式，修复daterangepicker IE8一下浏览器的bug
修复validation ie8下event.type bug
fix textbox IE下placeholder属性未定义报错的bug
fix datepicker allowBlank逻辑

# 0.2.8
重构datepicker、daterangepicker、coupledatepicker，提升渲染性能，避免IE6下statck overflow
修正smartgrid pager的渲染逻辑
fix coupledatepicker 多个绑定使用同一个配置项时rules共用bug
fix daterangepicker duplex值存在属性引用(比如data-daterangepicker-duplex="a.from, a.to")时，解析错误bug
为loading添加图片支持
为smartgrid添加checkbox过滤，详见avalon.smartgrid.ex2.html
让smartgrid在selectable.type为Checkbox时，根据数据源中是否有可选项来决定是否禁用全选按钮
修复smartgrid addRows添加全选行时逻辑错误bug
fix datepicker从2015-01-08切换到2014-12-30在切换回2015-01-31时逻辑错误bug
fix 对应单元格日期一致时高亮不能触发bug
fix loading 设置container的scan bug