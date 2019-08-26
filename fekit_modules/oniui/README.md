
# avalon.oniui

oniui-fekitRegistry

* 官网：

## 配置暴露出来的组件

在./config/exports.json中配置要使用的组件名称，目的是将要使用的组件文件引入index.js及index.css：

```
["accordion", "checkboxlist", "datepicker", "coupledatepicker", "daterangepicker", "dialog", "doublelist", "dropdown", "switchdropdown", "menu", "flipswitch", "notice", "pager", "scrollbar", "simplegrid", "spinner", "tab", "textbox", "suggest", "tooltip"]
```

默认组件在src中的目录结构为：

```
dropdown
├── avalon.dropdown.css
├── avalon.dropdown.doc.html
├── avalon.dropdown.ex1.html
├── avalon.dropdown.ex2.html
├── avalon.dropdown.ex3.html
├── avalon.dropdown.ex4.html
├── avalon.dropdown.ex5.html
├── avalon.dropdown.ex6.html
├── avalon.dropdown.ex7.html
├── avalon.dropdown.ex8.html
├── avalon.dropdown.ex9.html
├── avalon.dropdown.html
├── avalon.dropdown.js
└── avalon.dropdown.scss
```

运行build.js，该组件相关的js及css文件将会被放置于导出文件中。

### 如果在组件中的路径不符合上述结构怎么办

如suggest组件存在于textbox的目录下，该组件的目录结构如下：

```
./textbox/
├── avalon.suggest.css
├── avalon.suggest.ex.html
├── avalon.suggest.html
├── avalon.suggest.js
├── avalon.suggest.scss
├── avalon.textbox.css
├── avalon.textbox.doc.html
├── avalon.textbox.ex1.html
├── avalon.textbox.ex2.html
├── avalon.textbox.ex3.html
├── avalon.textbox.ex4.html
├── avalon.textbox.ex5.html
├── avalon.textbox.ex6.html
├── avalon.textbox.ex_adapter.html
├── avalon.textbox.html
├── avalon.textbox.js
├── avalon.textbox.scss
└── avalon.textbox.test.html
```

将suggest添加进./config/exports.json中之后，编辑/build.js文件

```
/**
 * 适配导出文件的路径
 * @param item 组件名称
 * @param suffix 要导出的文件后缀，如js css
 * @returns {*}
 */
function shim(item, suffix) {
    var route;
    if(item === 'suggest') {
        route = 'require("./textbox/' + 'avalon.' + item + '.' + suffix + '")';
    } else {
        route = 'require("./' + item + '/' + 'avalon.' + item + '.' + suffix + '")';
    }
    return route;
}
```

编辑了还不算完，记得一定要执行

```
node build.js
```

如果权限不过，使用```sudo```

## 将oniui组件转化为modules规范版本

```
npm install -g modules-cat
mkdir oniui
cd oniui
git clone git@
git clone https://github.com/RubyLouvre/avalon.oniui.git ./oniui
modules-cat nodejs ./oniui -o ./oniui_registry/src
```

转化工具可参考：[modules-cat](https://github.com/ilife5/cat)

## 将oniui组件发布为fekit registry

```
fekit publish
```







