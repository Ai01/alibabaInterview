const { consoleSplit } = require('./utils');

const WAIT = 'WAIT';
const WAIT_FIRST = 'WAIT_FIRST';
const DO = 'DO';

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
      this.stack.push({ type: WAIT, value: time });
      return this;
    }

    waitFirst(time) {
      if(!this.stack[0] || (this.stack[0] && this.stack[0].type !== WAIT_FIRST)) {
        this.stack.unshift({ type: WAIT_FIRST, value: time });
        return this;
      } else {
        throw new Error('already has waitFirst')
      }

    }

    do(task) {
      this.stack.push({ type: DO, value: task });
      return this;
    }

    execute() {
      const f = async () => {
        // waitFirst 处理
        if (this.stack[0] && this.stack[0].type === WAIT_FIRST) {
          await sleep(this.stack[0].value);

          console.log(`${this.name} is notified`);
          for (let i = 1; i < this.stack.length; i++) {
            const { type, value } = this.stack[i] || {};
            if (type === WAIT) {
              await sleep(value);
            }
            if (type === DO) {
              console.log(`start to ${value}`);
            }
          }
        } else {
          console.log(`${this.name} is notified`);
          for (let i = 0; i < this.stack.length; i++) {
            const { type, value } = this.stack[i] || {};
            if (type === WAIT) {
              await sleep(value);
            }
            if (type === DO) {
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
// arrange('test').wait(1000).do('push').execute();
arrange('test')
  .do('pull')
  .wait(1000)
  .do('push')
  .waitFirst(1000)
  .execute();
