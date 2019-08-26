/**
 *  @author: matt.liu
 *  @lastModify：matt.liu
 *  @lastModiftDate: 2015-10-23
 *  @fileoverview: avalon的验证组件拓展，之后页面的验证规则将在此对象进行统一维护
 *  @dependence：
 *  @other：
 */

var validationConfig = {
  validationHooks: {
    //重写required规则提示
    required: {
        message: '{{errorinfo}}',
        get: function (value, data, next) {
            data.data.errorinfo = data.element.getAttribute('errorinfo');
            if (!data.data.errorinfo) {
              data.data.errorinfo = '必须填写';
            }
            next(value !== '');
            return value;
        }
    },
    //限制长度
    maxlimit: {
      message: "长度必须小于{{maxLimit}}",
      get: function(value, data, next) {
        data.data.maxLimit = Number(data.element.getAttribute('maxlimit'));
        next(value.length <= data.data.maxLimit);
        return value;
      }
    },
    integer: {
      message: "必须为正整数",
      get: function(value, data, next) {
        next(/^[0-9]*[1-9][0-9]*$/g.test(value));
        return value;
      }
    },
    floattwo: {
      message: "必须为整数或者小数(最多两位)",
      get: function(value, data, next) {
        next(/^\d+$/g.test(value) || /^\d+\.\d{1,2}$/g.test(value));
        return value;
      }
    }
  },
  onInit: function(v) {
    validationVM = v;
  },
  onError: function(reasons) {
    reasons.forEach(function(reason) {
      validationConfig.showError(this, reason); 
    }, this);
  },
  onReset: function() {
    validationConfig.removeError(this);
  },
  onSuccess: function() {
    validationConfig.removeError(this);
  },
  validateInKeyup: false,
  showError: function(el, data) {
      var next = el.nextSibling;
      if (el.nextSibling) {
          next = el.nextSibling.nodeType === 1 ? el.nextSibling : el.nextSibling.nextSibling;
      }
      validationConfig.removeNextSibling(el, next);
      next = document.createElement("div");
      next.className = "error-tip";
      el.parentNode.appendChild(next);
      next.innerHTML = data.getMessage ? data.getMessage() : el.getAttribute('errorinfo');
  },
  //验证成功展示图标，验证失败展示文字提示
  removeError: function(el) {
      var next = el.nextSibling,
          successInfo = el.getAttribute('successInfo');
      if (next) {
          next = el.nextSibling.nodeType === 1 ? el.nextSibling : el.nextSibling.nextSibling;
      }
      validationConfig.removeNextSibling(el, next);
      if (!el.value) {
        return; 
      }
      if (!(next && (next.className === "success-tip" || next.className === "error-tip"))) {
          next = document.createElement("div");
          next.className = "success-tip";
          el.parentNode.appendChild(next);
          var successinfo = next.nextSibling;
          if (!(successinfo && successinfo.className === "success-tip") && el.getAttribute('data-successinfo')) {
            successinfo = document.createElement("div");
            successinfo.className = "successinfo";
            el.parentNode.appendChild(successinfo);
            successinfo.innerHTML = el.getAttribute('data-successinfo');
          }
      }
  },
  removeNextSibling: function(el, next) {
      if (next && next.className === "error-tip") {
          el.parentNode.removeChild(next);
      }
      if (next && next.className === "success-tip") {
          var successInfo = next.nextSibling;
          el.parentNode.removeChild(next);
          if (successInfo && successInfo.className === 'successinfo') {
            el.parentNode.removeChild(successInfo);
          }
      }
  },
  addRule: function(ruleName, obj) {
    var rules = this.validationHooks;
    for (var attr in rules) {
      if (rules.hasOwnProperty(ruleName)) {
        alert('已经定义名为' + ruleName + '验证规则，请重新命名需要添加的规则名称');
        return;
      }
    }
    this.validationHooks[ruleName] = obj;
  }
}

module.exports = validationConfig;