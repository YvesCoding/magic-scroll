import React from 'react';
import '../assets/style';
import Header from 'antdsite-header';
import Footer from 'antdsite-footer';
import { BackTop } from 'antd';
import MainContent from 'antdsite-main-content';
import { PageContext } from 'antdsite';
import Scrollbar from '../../../dist/magic-scroll';

export interface LayoutProps {
  isMobile: boolean;
}

interface LayoutState {
  windowHeight: number;
}

export default class Layout extends React.Component<LayoutProps, LayoutState> {
  static contextType = PageContext;

  constructor(props: LayoutProps) {
    super(props);

    this.state = {
      windowHeight: 0
    };
  }

  preSlug: String;

  render() {
    const {
      currentLocaleWebConfig: webConfig,
      slug,
      isWebsiteHome
    } = this.context;
    const { showBackToTop } = webConfig.themeConfig;
    const { locales, footer: footerText } = webConfig;

    const { windowHeight } = this.state;

    const footer = footerText ? (
      <Footer footeText={footerText} ref="footer" />
    ) : null;

    return (
      <div
        style={{
          height: windowHeight + 'px'
        }}
        className={`page-wrapper ${((!locales && slug == '/') ||
          (locales && Object.keys(locales).includes(slug))) &&
          'index-page-wrapper'}`}
      >
        <Scrollbar
          railOpacity={1}
          className="page-scrollbar"
          renderPanel={(props) => {
            return <div id="page-scrollbar-panel" {...props}></div>;
          }}
        >
          <Header {...this.props} />
          <MainContent
            {...this.props}
            isWebsiteHome={isWebsiteHome}
            footer={footer}
          />
          {showBackToTop ? <BackTop /> : null}
        </Scrollbar>
      </div>
    );
  }

  componentDidMount() {
    this.chekScrollPosition(this.context.slug);
    window.addEventListener('resize', this.setWindowHeight);
    this.setWindowHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setWindowHeight);
  }

  componentDidUpdate() {
    this.chekScrollPosition(this.context.slug);
  }

  chekScrollPosition(slug?: string) {
    if (!window.location.hash && slug && slug !== this.preSlug) {
      window.scrollTo(0, 0);
      this.preSlug = slug;
    } else if (window.location.hash) {
      const element = document.getElementById(
        decodeURIComponent(window.location.hash.replace('#', ''))
      );
      setTimeout(() => {
        if (element) {
          element.scrollIntoView(true);
        }
      }, 100);
    }
  }

  setWindowHeight = () => {
    this.setState({
      windowHeight: window.innerHeight
    });
  }
}
