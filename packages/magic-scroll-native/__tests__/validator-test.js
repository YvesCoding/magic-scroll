// import React from 'react';

import { mount } from 'enzyme';
import NativeBar from '../index';
import { createbar } from '../../../test/util';

describe('Native validator test.', function() {
  it("Constainer's background style should be blue. ", async function() {
    expect(() =>
      mount(
        createbar(NativeBar, {
          props: {
            sizeStrategy: 'foo'
          }
        })
      )
    ).toWarnDev(
      "[magic-scroll] Unexpected strategy: foo, except 'percent' or 'number'.",
      {
        withoutStack: true
      }
    );
  });
});
