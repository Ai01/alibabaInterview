// 工具函数
// 判断两个数组对应下标的元素是否相等
const isArrayEqual = (arr1, arr2) => {
  if(!Array.isArray(arr1) || !Array.isArray((arr2))) {
    throw new Error('arguments error')
  }

  if(arr1.length !== arr2.length) return false;

  let res = true;
  for(let i = 0; i < arr1.length; i++) {
    if(arr1[i] !== arr2[i]){
      res = false;
      break;
    }
  }

  return res;
}

// 分隔符
const consoleSplit = () => {
  console.log('-----------------------');
}

module.exports = {
 isArrayEqual,
 consoleSplit,
};
