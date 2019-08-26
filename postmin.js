/**
 * @Author: zhiqiang.wang
 * @Date:   2015-04-16 
 * @Last Modified by:   baotong.wang
 * @Last Modified time: 2015-09-09
 * @author zhiqiang.wang  from ss.feng@
 * @overview: 增加了一个页面对多个css, js引用添加ver文件的支持. 2015-09-09
 */

var fs = require("fs");
var path = require("path");

function scanFolder(path) {
	var fileList = [],
		folderList = [];

	var getStats = function(path) {
		try {
			return fs.statSync(path);
		} catch (e) {
			return e;
		}
	};

	var walk = function(path, fileList, folderList) {
		var stats = getStats(path);
		if (stats.isFile || stats.isDirectory) {
			if (stats.isFile() || stats.isDirectory) {
				var files = fs.readdirSync(path);
				files.forEach(function(item) {
					var tmp = path + "/" + item,
						stats = getStats(tmp);

					if (stats.isDirectory()) {
						walk(tmp, fileList, folderList);
						folderList.push(tmp);
					} else {
						fileList.push(tmp);
					}

				});
			}
		} else {
			console.log("未完成扫描，原因：" + stats);
		}
	};

	walk(path, fileList, folderList);

	return {
		files: fileList,
		folders: folderList
	};
}

function extFilter(files, ext) {
	var fileList = [];
	files.forEach(function(item) {
		if (path.extname(item) === ext) {
			fileList.push(item);
		}
	});
	return fileList;
}

function vmFilter(files) {
	return extFilter(files, ".vm");
}

function jsonFilter(files) {
	return extFilter(files, ".json");
}

function addSignFile(file) {
	var content = fs.readFileSync(file, "utf-8");
	var cssRe = /"\${qzzUrl}\${cssPath}[^>]+"/g;
	var jsRe = /"\${qzzUrl}\${jsPath}[^>]+"/g;

	var flag = 0;
	var originPath,
		newPath;

	if (cssRe.test(content)) {
		var cssPaths = content.match(cssRe),
			path,
			i;

		for (i = 0, len = cssPaths.length; i < len; i++) {
			originPath = path = cssPaths[i];

			if (/\${cssPath}([^>]+)/.test(path)) {
				path = path.match(/\${cssPath}([^>]+)"/)[1];
				path = "/styles" + path;
				path = "./refs/ver" + path + ".ver";

				if (fs.existsSync(path)) {
					//get ver file content
					var ver = fs.readFileSync(path, "utf-8");
					//risk, the filename can't contain '.css'
					newPath = originPath.replace('.css', '@' + ver + '.css');

					content = content.replace(originPath, newPath);
					flag++;
				}
			}
		}

	}
	if (jsRe.test(content)) {
		var jsPaths = content.match(jsRe);

		for (i = 0, len = jsPaths.length; i < len; i++) {
			originPath = path = jsPaths[i];

			if (/\${jsPath}([^>]+)/.test(path)) {

				path = path.match(/\${jsPath}([^>]+)"/)[1];
				path = "/scripts" + path;
				path = "./refs/ver" + path + ".ver";

				if (fs.existsSync(path)) {
					//get the ver file content
					var ver = fs.readFileSync(path, "utf-8");
					//risk, the filename can't contain '.js'
					newPath = originPath.replace('.js', '@' + ver + '.js');

					content = content.replace(originPath, newPath);
					//content = content.replace(/(\${qzzUrl}.+)\.js"/, "$" + String(i + 1) + "@" + ver + '.js"');
					flag++;
				}
			}
		}
	}

	fs.writeFileSync(file, content, "utf-8");
	return flag > 0 ? true : false;
}

function addSignFiles(files) {
	var tmp = [];

	files.forEach(function(item) {
		if (addSignFile(item)) {
			tmp.push(item);
		}
	});
	return tmp;
}

function deleteJosnFiles(files) {
	var jsonFiles = jsonFilter(files);

	jsonFiles.forEach(function(item) {
		if (fs.existsSync(item)) {
			fs.unlinkSync(item);
		}
	});
}

function main(argv) {
	console.log("===========================");
	console.log("===vm静态文件版本号工具===");
	console.log("=========v 1.0.1 baotong===========");
	console.log("===========================");

	var files = scanFolder(argv).files;
	var vmFiles = vmFilter(files);
	var list = addSignFiles(vmFiles);
	console.log("共处理文件" + list.length + "个");

	list.forEach(function(item) {
		console.log("[LOG] " + item);
	});

	// 删除vm目录下的json文件
	deleteJosnFiles(files);
}

main("./refs/vm/page");