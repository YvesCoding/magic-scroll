import React from 'react';

import { shallow, mount, render } from 'enzyme';
import { startSchedule, wrapPromise } from 'shared/schedule-test';
import NativeBar from '../index';

function createNativebar(childWid, childHei, parentHei, parentWid) {
  return (
    <div style={{ width: parentWid + 'px', height: parentHei + 'px' }}>
      <NativeBar>
        <div style={{ width: childWid + 'px', height: childHei + 'px' }} />
      </NativeBar>
    </div>
  );
}

describe('A suite', function() {
  it('should render without throwing an error', async function() {
    const bar = mount(createNativebar(200, 200, 100, 100));
    // expect(bar.find('.__bar.__is-vertical')).toBe(50);
    await wrapPromise((resolve, reject) => {
      startSchedule(100).then(resolve);
    });
    console.log(bar.getDOMNode().outerHTML);
  });
});
