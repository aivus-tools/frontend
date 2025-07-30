import type { ThemeConfig } from 'antd';

const mainDark = '#121b3e';
const white = '#fff';

const theme: ThemeConfig = {
  token: {
    fontFamily: 'inherit',
    colorPrimary: '#2288FF',
    colorText: ' #4B5675',
  },
  components: {
    Layout: {
      siderBg: mainDark,
      bodyBg: white,
      headerBg: white,
      triggerBg: '#121b3ef5',
      headerHeight: '70px',
    },
    Button: {
      fontWeight: 600,
      defaultColor: 'rgb(75, 86, 117)',
    },
    Tabs: {
      cardGutter: 0,
    },
  },
};

export default theme;
