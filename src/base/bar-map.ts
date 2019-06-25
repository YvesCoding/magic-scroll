export interface MapInterface {
  size: 'height' | 'width';
  opsSize: 'width' | 'height';
  posName: 'top' | 'left';
  opposName: 'bottom' | 'right';
  sidePosName: 'right' | 'bottom';
  page: 'pageY' | 'pageX';
  scroll: 'scrollTop' | 'scrollLeft';
  scrollSize: 'scrollHeight' | 'scrollWidth';
  offset: 'offsetHeight' | 'offsetWidth';
  client: 'clientY' | 'clientX';
  axis: 'x' | 'y';
  scrollButton: {
    start: 'top' | 'left';
    end: 'bottom' | 'right';
  };
}

const map: {
  vertical: MapInterface;
  horizontal: MapInterface;
} = {
  vertical: {
    size: 'height',
    opsSize: 'width',
    posName: 'top',
    opposName: 'bottom',
    sidePosName: 'right',
    page: 'pageY',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    offset: 'offsetHeight',
    client: 'clientY',
    axis: 'y',
    scrollButton: {
      start: 'top',
      end: 'bottom'
    }
  },
  horizontal: {
    size: 'width',
    opsSize: 'height',
    posName: 'left',
    opposName: 'right',
    sidePosName: 'bottom',
    page: 'pageX',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    offset: 'offsetWidth',
    client: 'clientX',
    axis: 'x',
    scrollButton: {
      start: 'left',
      end: 'right'
    }
  }
};
export default map;
