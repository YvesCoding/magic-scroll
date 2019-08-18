module.exports = {
  title: 'MagicSroll',
  footer: 'MIT Licensed | Copyright © 2019-present Yi(Yves) Wang',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'MagicSroll.js',
      description:
        'A customizable scrollbar plugin based on React.js for PC and mobile phone'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'MagicSroll.js',
      description: '一个React.js的自定义滚动条插件'
    }
  },
  logo: '/logo.png',
  head: [['link', { rel: 'icon', href: `/logo.png` }]],
  themeConfig: {
    repo: 'YvesCoding/magic-scroll',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated', // string | boolean
        nav: [
          {
            text: 'Guide',
            link: '/guide/'
          },
          {
            text: 'Demo',
            link: '/demo/'
          },
          {
            text: 'GitHub',
            link: 'https://github.com/YvesCoding/magic-scroll',
            important: true
          }
        ],
        sidebar: {
          '/guide/': genSidebarConfig('Guide')
        }
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新', // string | boolean
        nav: [
          {
            text: '指南',
            link: '/zh/guide/'
          },
          {
            text: 'Demo',
            link: '/zh/demo/'
          },
          {
            text: 'GitHub',
            link: 'https://github.com/YvesCoding/magic-scroll',
            important: true
          }
        ],
        sidebar: {
          '/zh/guide/': genSidebarConfig('指南')
        }
      }
    }
  }
};

function genSidebarConfig(title) {
  return [
    {
      title,
      collapsable: false,
      children: ['', 'getting-started', 'props', 'event', 'api']
    }
  ];
}
