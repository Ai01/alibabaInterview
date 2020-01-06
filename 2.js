const { consoleSplit } = require('./utils');

const f = (res, str, left, right) => {
  if (left === 0 && right === 0) {
    res.push(str);
    return;
  }

  // 如果左括号比右括号少，可以放入右括号
  if (left < right) {
    f(res, str + ')', left, right - 1);
  }

  // 左括号永远都可以放
  if (left > 0) {
    f(res, str + '(', left - 1, right);
  }
};

const generateParenthesis = n => {
  if (n === 0) return [];
  const res = [];
  f(res, '', n, n);
  return res;
};

// 测试
console.log(generateParenthesis(3));
consoleSplit();
console.log(generateParenthesis(4));
