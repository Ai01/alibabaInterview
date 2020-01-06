const { consoleSplit } = require('./utils');

const sleep = time =>
  new Promise(resolve => {
    setTimeout(resolve, time);
  });

const arrange = function(name) {
  class Schedule {
    constructor() {
      this.name = name;
      this.stack = [];
      this.wait = this.wait.bind(this);
      this.waitFirst = this.waitFirst.bind(this);
      this.do = this.do.bind(this);
      this.execute = this.execute.bind(this);
    }

    wait(time) {
      this.stack.push({ type: 'wait', value: time });
      return this;
    }

    waitFirst(time) {
      this.stack.unshift({ type: 'waitFirst', value: time });
      return this;
    }

    do(task) {
      this.stack.push({ type: 'do', value: task });
      return this;
    }

    execute() {
      const f = async () => {
        // waitFirst 处理
        if (this.stack[0] && this.stack[0].type === 'waitFirst') {
          await sleep(this.stack[0].value);

          console.log(`${this.name} is notified`);
          for (let i = 1; i < this.stack.length; i++) {
            const { type, value } = this.stack[i] || {};
            if (type === 'wait') {
              await sleep(value);
            }
            if (type === 'do') {
              console.log(`start to ${value}`);
            }
          }
        } else {
          console.log(`${this.name} is notified`);
          for (let i = 0; i < this.stack.length; i++) {
            const { type, value } = this.stack[i] || {};
            if (type === 'wait') {
              await sleep(value);
            }
            if (type === 'do') {
              console.log(`start to ${value}`);
            }
          }
        }
      };
      f();
    }
  }
  return new Schedule(name);
};

// arrange('test').do('push').execute();
arrange('test').wait(1000).do('push').execute();
// arrange('test')
//   .do('push')
//   .waitFirst(1000)
//   .execute();
