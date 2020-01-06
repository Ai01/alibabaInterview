const { isArrayEqual, consoleSplit } = require('./utils');

// tag type
const TAG_TYPES = {
  div: 'div',
  span: 'span',
};

// token type
const TOKEN_TYPES = {
  '/>': { type: 'TAG_END_WITHOUT_TYPE', value: '/>' },
  '>': { type: 'TAG_END_WITHOUT_TYPE_WITHOUT_SLASH', value: '>' },
};
Object.values(TAG_TYPES).forEach(i => {
  TOKEN_TYPES[`<${i}`] = { type: `TAG_START`, value: `${i}` };
  TOKEN_TYPES[`</${i}>`] = { type: `TAG_END_WITH_TYPE`, value: `${i}` };
});

// 根据</, />, <, >, tag_types为分隔符，扫描出token list
const splitHtmlStr = str => {
  if (typeof str !== 'string') throw new Error('argument should be string');

  let regStr = '(/>)|(>)';
  Object.values(TAG_TYPES).forEach(i => {
    regStr += `|(</${i}>)|(<${i})`;
  });
  const reg = new RegExp(regStr);
  return str.split(reg).filter(i => i);
};

// 处理自闭和标签
// 根据结构匹配来找到对应的自闭合标签
const tagParserForSelfClose = tokenList => {
  if (!Array.isArray(tokenList)) throw new Error('argument should be array');
  tokenList = [...tokenList.filter(i => i && i.type)];

  // 自闭合标签的token组成
  const structureWithProps = ['TAG_START', 'TEXT', 'TAG_END_WITHOUT_TYPE'];
  const structureWithoutProps = ['TAG_START', 'TAG_END_WITHOUT_TYPE'];

  for (let i = 0; i < tokenList.length; i++) {
    // 处理有props的自闭合标签
    if (i + 2 <= tokenList.length) {
      const templateTokenList = [tokenList[i], tokenList[i + 1], tokenList[i + 2]].filter(i => i);
      if (templateTokenList.length === 3) {
        const types = templateTokenList.map(i => {
          return i ? i.type : null;
        });
        if (isArrayEqual(types, structureWithProps)) {
          const astNode = {
            tag: tokenList[i].value,
            selfClose: true,
            attributes: tokenList[i + 1].value,
          };
          tokenList.splice(i, 3, astNode);
        }
      }
    }

    // 处理没有props的自闭合标签
    if (i + 1 <= tokenList.length) {
      const templateTokenList = [tokenList[i], tokenList[i + 1]].filter(i => i);
      if (templateTokenList.length === 2) {
        const types = templateTokenList.map(i => i.type);
        if (isArrayEqual(types, structureWithoutProps)) {
          const astNode = {
            tag: tokenList[i].value,
            selfClose: true,
          };

          tokenList.splice(i, 2, astNode);
        }
      }
    }
  }

  return tokenList;
};

// 文字节点的处理
// 根据token可以判断。只要不是在TAG_START token后面的TEXT都是文字节点
const textNodeParser = tokenList => {
  if (!Array.isArray(tokenList)) throw new Error('argument should be array');

  for (let i = 0; i < tokenList.length; i++) {
    if (tokenList[i] && tokenList[i].type === 'TEXT' && tokenList[i - 1].type !== 'TAG_START') {
      const astNode = {
        tag: tokenList[i].value,
      };
      tokenList.splice(i, 1, astNode);
    }
  }
};

// 处理非自闭和标签
// 需要先将已经处理好的标签拿出去，并记住位置
const tagParserForNotSelfClose = tokenList => {
  if (!Array.isArray(tokenList)) throw new Error('argument should be array');
  tokenList = [...tokenList];

  // 非自闭合标签的开始部分token组成
  const structureWithProps = ['TAG_START', 'TEXT', 'TAG_END_WITHOUT_TYPE_WITHOUT_SLASH'];
  const structureWithoutProps = ['TAG_START', 'TAG_END_WITHOUT_TYPE_WITHOUT_SLASH'];

  for (let i = 0; i < tokenList.length; i++) {
    // 处理有props的非自闭合标签
    if (i + 3 <= tokenList.length) {
      const tagStart = [tokenList[i], tokenList[i + 1], tokenList[i + 2]];
      const types = tagStart.map(i => (i ? i.type : null));
      if (isArrayEqual(types, structureWithProps)) {
        const tagType = tokenList[i].value;

        let sameTypeTagStart = 0;
        let j = i+1;
        const astNode = {
          tag: tagType,
          selfClose: false,
          attributes: tokenList[i + 1].value,
          children: [],
        };
        while (j < tokenList.length) {
          // 如果有tag_start而且type相等, sameTypeTagStart + 1
          if(tokenList[j] && tokenList[j].type === 'TAG_START' && tokenList[j].value === tagType) {
            sameTypeTagStart += 1;
          }

          // 如果找到tag_end_with_type而且type相等,如果sameTagStart === 0那么中间的都是children
          if (tokenList[j] && tokenList[j].type === 'TAG_END_WITH_TYPE' && tokenList[j].value === tagType) {
            if(sameTypeTagStart === 0) {
              // 将children赋值
              astNode.children = tokenList.slice(i+3, j - i);
              // 将标签结束部分删除
              tokenList.splice(j, 1);
              // 如果这个标签处理完毕。退出循环
              break;
            } else {
              sameTypeTagStart -= 1;
            }
          }

          j++;
        }

        astNode.children = tagParserForNotSelfClose(astNode.children);
        // 改变tokenList，将这次的操作回填到tokenList中
        tokenList.splice(i, j, astNode);
      }
    }

    // 处理没有props的自闭合标签
    // 区别在于structure
    if (i + 2 <= tokenList.length) {
      const tagStart = [tokenList[i], tokenList[i + 1]];
      const types = tagStart.map(i => (i ? i.type : null));
      if (isArrayEqual(types, structureWithoutProps)) {
          const tagType = tokenList[i].value;

          const astNode = {
            tag: tagType,
            selfClose: false,
            children: [],
          };

          let sameTypeTagStart = 0;
          let j = i;
          // 找到非自闭合标签的children
          while (j < tokenList.length) {
            if (tokenList[j] && tokenList[j].type === 'TAG_END_WITH_TYPE' && tokenList[j].value === tagType) {
              if(sameTypeTagStart === 0) {
                astNode.children = tokenList.slice(i+2, j - i);
                tokenList.splice(j, 1);
                break;
              } else {
                sameTypeTagStart -= 1;
              }
            }
            if(tokenList[j] && tokenList[j].type === 'TAG_START' && tokenList[j].value === tagType) {
              sameTypeTagStart += 1;
            }
            j++;
          }

          astNode.children = tagParserForNotSelfClose(astNode.children);
          tokenList.splice(i, j, astNode);
        }
    }
  }

  return tokenList;
};

const htmlParser = str => {
  const strAfterSplit = splitHtmlStr(str);

  // 生成token list
  const TOKEN_LIST = strAfterSplit.map(i => {
    if (TOKEN_TYPES[i]) return TOKEN_TYPES[i];
    return { type: 'TEXT', value: i };
  });

  // 自合标签合字符串都是没有children的。先处理
  const ast = tagParserForSelfClose(TOKEN_LIST);
  textNodeParser(ast);

  // 处理非自闭合标签
  return tagParserForNotSelfClose(ast);
};

// test1
// 多个自闭合标签，一个非自闭合标签
const htmlStr = '<div id="main" data-x="hello">Hello<span id="sub" /><div id="test" /></div>';
const res = htmlParser(htmlStr);
console.log('input',htmlStr);
console.log('res', res);

consoleSplit();

// test2
// 多个自闭合标签， 多个非自闭合标签
const htmlStr2 = '<div id="main" data-x="hello"><div id="test-div" >Hello</div><span id="sub" /><div id="test" /></div>';
const res2 = htmlParser(htmlStr2);
console.log('input',htmlStr2);
console.log('res', res2);

