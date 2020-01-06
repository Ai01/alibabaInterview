const findFibonacci = (arr) => {
  if(!Array.isArray(arr)) return null;


  const map = {};
  // a用来保存arr的不同元素之和是否在arr中
  const a = [];
  for(let i = 0; i<arr.length; i++) {
    map[arr[i]] = i;
    if(!Array.isArray(a[i])) {
      a[i] = [];
    }
  }

  for(let i = 0; i<arr.length;i++) {
    for(let j = 0; j<arr.length; j++) {
      let sum = arr[i] + arr[j];
      a[i][j] =  map[sum] ? { sumIndex: map[sum], sum, x: arr[i], y: arr[j] } : null;
    }
  }

  console.log(a);

  // 遍历a找到其中最长的Fibonacci数组
  let maxLengthRes = [];

  f = (r = [], i) => {
    // 用来做最后的判断
    let hasNext = false;
    for(let j = 0; j<a[i].length; j++) {
      if(a[i][j]) {
        hasNext = true;
        const { sum, y, sumIndex } = a[i][j];
        let _r = r.concat([y, sum]);
        f(_r, sumIndex);
      }
    }
    if(!hasNext && r.length > maxLengthRes.length) {
      maxLengthRes = r;
    }
  }

  for (let i = 0; i<a.length; i++) {
    for(let j = 0; j<a[i].length; j++) {
      if(a[i][j]) {
        const { x, y, sum, sumIndex } = a[i][j];
        f([x, y, sum], sumIndex);
      }
    }
  }

  return maxLengthRes;
};










// test
const inputArr = [13, 9, 3, 8, 5, 25, 31, 11, 21];
console.log('input', inputArr);
console.log(findFibonacci(inputArr));
