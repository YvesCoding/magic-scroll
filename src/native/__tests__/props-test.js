// import React from 'react';

import { mount } from 'enzyme';
import NativeBar from '../index';
import { createbar } from '../../../test/util';

describe('Native Bar Props Test', function() {
  // Props: Style
  it("Constainer's background style should be blue. ", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          style: {
            background: 'blue'
          }
        }
      })
    );
    const container = wrapper.find('.__magic-scroll').getDOMNode();
    expect(container.style.background).toBe('blue');
  });

  // Props: ClassNmae
  it("Container's calss should contains foo.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          className: 'foo'
        }
      })
    );
    const container = wrapper.find('.__magic-scroll');
    expect(container.hasClass('foo')).toBe(true);
  });

  // Props: sizeStrategy
  it("Container's width and height should be 100px.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          sizeStrategy: 'number'
        }
      })
    );
    const container = wrapper.find('.__magic-scroll');
    expect(container.getDOMNode().style.height).toBe('100px');
    expect(container.getDOMNode().style.width).toBe('100px');
  });

  // Props: initialScroll
  it("Bar's transform should be 50%.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          initialScrollY: 50,
          initialScrollX: 50
        }
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    wrapper.instance().scrollbar._handleScroll();

    const transofrmY = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .transform;
    const transofrmX = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .transform;

    expect(transofrmY).toBe('translateY(50%)');
    expect(transofrmX).toBe('translateX(50%)');
  });

  // Props: barSize
  it("Bar's size should be 4px", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barSize: '4px'
        }
      })
    );

    const width = wrapper.find('.__bar.__is-vertical').getDOMNode().style.width;
    const height = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .height;

    expect(width).toBe('4px');
    expect(height).toBe('4px');
  });

  // Props: barMinSize
  it("Bar's size should be 60%", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barMinSize: 0.6,
          initialScrollX: 100,
          initialScrollY: 100
        }
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    wrapper.instance().scrollbar._handleScroll();

    const height = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .height;
    const width = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .width;

    expect(width).toBe('60%');
    expect(height).toBe('60%');
  });

  // Props: barBorderRadius
  it("Bar's border-radius should be 5px%", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barBorderRadius: '5px'
        }
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    wrapper.instance().scrollbar._handleScroll();

    const vBarBorderRadius = wrapper
      .find('.__bar-wrap.__is-vertical')
      .getDOMNode().style.borderRadius;
    const hBarBorderRadius = wrapper
      .find('.__bar-wrap.__is-horizontal')
      .getDOMNode().style.borderRadius;

    expect(vBarBorderRadius).toBe('5px');
    expect(hBarBorderRadius).toBe('5px');
  });

  // Props: barKeepShowTime
  it('Bar should hide after 1 second.', async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barKeepShowTime: 1000
        }
      })
    );

    wrapper.find('.__magic-scroll').simulate('mouseenter');

    let vBarOpacity = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .opacity;
    let hBarOpacity = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .opacity;

    expect(vBarOpacity).toBe('1');
    expect(hBarOpacity).toBe('1');

    wrapper.find('.__magic-scroll').simulate('mouseleave');

    await new Promise((resolve) => setTimeout(resolve, 500));
    vBarOpacity = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .opacity;
    hBarOpacity = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .opacity;
    expect(vBarOpacity).toBe('1');
    expect(hBarOpacity).toBe('1');

    await new Promise((resolve) => setTimeout(resolve, 500));
    vBarOpacity = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .opacity;
    hBarOpacity = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .opacity;
    expect(vBarOpacity).toBe('0');
    expect(hBarOpacity).toBe('0');
  });

  // Props: keepBarShow
  it('Bar should not hide.', async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          keepBarShow: true
        }
      })
    );

    wrapper.find('.__magic-scroll').simulate('mouseleave');
    let vBarOpacity = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .opacity;
    let hBarOpacity = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .opacity;

    expect(vBarOpacity).toBe('1');
    expect(hBarOpacity).toBe('1');
  });

  // Props: onlyShowBarOnScroll
  it('Bar should show when mouseenter is triggered.', async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          onlyShowBarOnScroll: false
        }
      })
    );

    wrapper.find('.__magic-scroll').simulate('mouseenter');
    let vBarOpacity = wrapper.find('.__bar.__is-vertical').getDOMNode().style
      .opacity;
    let hBarOpacity = wrapper.find('.__bar.__is-horizontal').getDOMNode().style
      .opacity;

    expect(vBarOpacity).toBe('1');
    expect(hBarOpacity).toBe('1');
  });

  // Props: barCls
  it("Bar's opacity should be 0.5", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barOpacity: 0.5
        }
      })
    );

    wrapper.find('.__magic-scroll').simulate('mouseenter');

    expect(
      wrapper.find('.__bar.__is-vertical').getDOMNode().style.opacity
    ).toBe('0.5');
    expect(
      wrapper.find('.__bar.__is-horizontal').getDOMNode().style.opacity
    ).toBe('0.5');
  });

  // Props: barCls
  it("Bar's class should contain foo", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          barCls: 'foo'
        }
      })
    );

    wrapper.instance().scrollbar._handleScroll();

    expect(wrapper.find('.__bar.__is-vertical').hasClass('foo')).toBe(true);
    expect(wrapper.find('.__bar.__is-horizontal').hasClass('foo')).toBe(true);
  });

  // Props: railBg
  it("Rail's background should be red", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          railBg: 'rgba(255, 0, 0, 0)'
        }
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    wrapper.instance().scrollbar._handleScroll();

    const vRailBg = wrapper.find('.__rail.__is-vertical').getDOMNode().style
      .background;
    const hRailBg = wrapper.find('.__rail.__is-horizontal').getDOMNode().style
      .background;

    expect(vRailBg).toBe('rgba(255, 0, 0, 0)');
    expect(hRailBg).toBe('rgba(255, 0, 0, 0)');
  });

  // Props: railCls
  it("Rail's class should contain foo", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          railCls: 'bar'
        }
      })
    );

    expect(wrapper.find('.__rail.__is-vertical').hasClass('bar')).toBe(true);
    expect(wrapper.find('.__rail.__is-horizontal').hasClass('bar')).toBe(true);
  });

  // Props: railSize
  it("Rail's size should be 15px.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          railSize: '15px'
        }
      })
    );

    expect(wrapper.find('.__rail.__is-vertical').getDOMNode().style.width).toBe(
      '15px'
    );
    expect(
      wrapper.find('.__rail.__is-horizontal').getDOMNode().style.height
    ).toBe('15px');
  });

  // Props: railBorderRadius
  it("Rail's border radius should be 8px.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          railBorderRadius: '8px'
        }
      })
    );

    expect(
      wrapper.find('.__rail.__is-vertical').getDOMNode().style.borderRadius
    ).toBe('8px');
    expect(
      wrapper.find('.__rail.__is-horizontal').getDOMNode().style.borderRadius
    ).toBe('8px');
  });

  // Props: keepRailShow
  it("Rail's border radius should be 8px.", async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          keepRailShow: true
        },
        childWid: 50,
        childHei: 50
      })
    );

    expect(wrapper.find('.__rail.__is-horizontal').length > 0).toBe(true);
    expect(wrapper.find('.__rail.__is-vertical').length > 0).toBe(true);
  });

  // Props: scrollButtonEnable
  it('Scroll button can be seen.', async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          scrollButtonEnable: true
        }
      })
    );

    expect(wrapper.find('.__bar-button').length).toBe(4);
  });

  // Props: scrollButtonEnable
  it('Scroll button can be seen.', async function() {
    const wrapper = mount(
      createbar(NativeBar, {
        props: {
          scrollButtonEnable: true
        }
      })
    );

    expect(wrapper.find('.__bar-button').length).toBe(4);
  });
});
