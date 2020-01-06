const { consoleSplit } = require('./utils');

const findFibonacci = arr => {
  if (!Array.isArray(arr)) return null;

  // map用来简化indexOf操作
  const map = {};
  // a是一个二维数组，a用来保存arr的不同元素之和是否在arr中
  const a = [];
  for (let i = 0; i < arr.length; i++) {
    map[arr[i]] = i;
    if (!Array.isArray(a[i])) {
      a[i] = [];
    }
  }

  // 为a填上内容，a[i][j]表示arr[i] + arr[j] 的信息，
  // 如果和在arr中，那么保存下sum和sum的index,还有arr[i],arr[j]
  // 如果和不在为null
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      let sum = arr[i] + arr[j];
      a[i][j] = typeof map[sum] === 'number' ? { sumIndex: map[sum], sum, x: arr[i], y: arr[j] } : null;
    }
  }

  // 遍历a找到其中最长的Fibonacci数组
  let maxLengthRes = [];

  const findPath = (r = [], i) => {
    // 用来做最后的判断,如果没有下一个了才是最终结果
    let hasNext = false;

    for (let j = 0; j < a[i].length; j++) {
      if(!a[i][j]) continue;

      const { sum, y, sumIndex } = a[i][j];
      // 如果y不是r倒数第二个值那么舍弃
      if(y !== r[r.length - 2]) continue;
      // 如果sum已经出现过了，舍弃
      if(r.indexOf(sum) !== -1) continue;

      hasNext = true;
      // 应为x已经在上一轮中加入res了。所以这一轮需要加入y和sum
      findPath(r.concat([sum]), sumIndex);
    }

    // 如果是最后（hasNext为false)，并且长度更大，那么改变maxRes
    if (!hasNext && r.length > maxLengthRes.length) {
      maxLengthRes = r;
    }
  };

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j]) {
        const { x, y, sum, sumIndex } = a[i][j];
        findPath([x, y, sum], sumIndex);
      }
    }
  }

  return maxLengthRes;
};

// 一般情况
const inputArr = [13, 9, 3, 8, 5, 25, 31, 11, 21];
console.log('input', inputArr);
console.log(findFibonacci(inputArr));

consoleSplit();

// 全部是
const inputArr1 = [3, 4, 7, 11, 18];
console.log('input', inputArr1);
console.log(findFibonacci(inputArr1));

consoleSplit();

// 不存在
const inputArr2 = [3,5, 11, 65, 34];
console.log('input', inputArr2);
console.log(findFibonacci(inputArr2));
