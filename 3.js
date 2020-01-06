const getUrlQuery = url => {
  if (typeof url !== 'string') return null;

  const queryStr = url.split(/\?(.*)\#/)[1];

  const res = {};
  if (typeof queryStr === 'string') {
    queryStr.split('&').map(i => {
      const _str = i.split('=');
      const key = _str[0];
      const value = _str[1];
      res[key] = value;
    });
  }

  return res;
};

// test
const url = 'http://sample.com/?a=1&b=2&c=xx&d#hash';
console.log(getUrlQuery(url));
