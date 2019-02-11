import { shallow, mount, render } from 'enzyme';
import NativeBar from '../index';
import { createbar } from '../../../test/util';

describe('Baseic Test', function() {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Basic render should match snapshot', async function() {
    const bar = mount(
      createbar(NativeBar, {
        props: { scrollButtonEnable: true }
      })
    );
    jest.advanceTimersByTime(1000);
    expect(bar.render().html()).toMatchSnapshot();
  });
});
