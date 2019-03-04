import { mount } from 'enzyme';
import NativeBar from '../index';
import { createbar } from '../../../test/util';

describe('Baseic Test', function() {
  let bar;
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
    bar.unmount();
  });

  it('Basic render should match snapshot', async function() {
    bar = mount(
      createbar(NativeBar, {
        props: { scrollButtonEnable: true }
      })
    );
    expect(bar.render().html()).toMatchSnapshot();
  });
});
