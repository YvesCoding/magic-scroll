export function wrapPromise(cb) {
  return new Promise((resolve, reject) => {
    cb(resolve, reject);
  });
}

export function startSchedule(time = 0) {
  let queue = [];
  function wait(time = 0) {
    queue.push({
      type: 'wait',
      value: time
    });
    return {
      then,
      wait
    };
  }
  function then(cb = () => {}) {
    queue.push({
      type: 'then',
      value: cb
    });
    return {
      then,
      wait
    };
  }
  function loopSchedule() {
    if (!queue.length) {
      return;
    }

    let current = queue.shift();
    if (current.type == 'wait') {
      setTimeout(() => {
        loopSchedule();
      }, current.value);
    } else if (current.type == 'then') {
      if (current.value.length > 0) {
        let timeId = setTimeout(() => {
          loopSchedule();
        }, 5000); // timeout 5s
        current.value(() => {
          clearTimeout(timeId);
          setTimeout(() => {
            loopSchedule();
          }, 0);
        });
      } else {
        current.value();
        setTimeout(() => {
          loopSchedule();
        }, 0);
      }
    }
  }

  queue.push({
    type: 'wait',
    value: time
  });

  loopSchedule();
  return {
    then,
    wait
  };
}
