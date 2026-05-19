import type { ThemeConfig } from 'antd';

export const colors = {
  brandPrimary: '#2288FF',
  brandPrimaryText: '#0a66c2',
  textHeading: '#121b3e',
  textPrimary: '#4b5675',
  textSecondary: '#5b6478',
  textTertiary: '#6e7689',
  bgLayout: '#f6f7f9',
  bgContainer: '#ffffff',
  border: '#e5e5e5',
  borderSecondary: '#eff4fe',
  error: '#d63c22',
  errorText: '#b8311c',
  success: '#a5c500',
  successText: '#5f7300',
  warning: '#fd8258',
  warningText: '#a14216',
  infoBg: '#e1f5ff',
  siderBg: '#121b3e',
  siderTrigger: '#121b3ef5',
  siderMask: 'rgba(18, 27, 62, 0.55)',
  boxShadow: '0 5px 16.5px -11px rgba(0, 0, 0, 0.25)',
} as const;

const theme: ThemeConfig = {
  token: {
    fontFamily: 'inherit',
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 18,
    fontSizeHeading4: 20,

    colorPrimary: colors.brandPrimary,
    colorPrimaryText: colors.brandPrimaryText,
    colorPrimaryTextHover: colors.brandPrimaryText,
    colorPrimaryTextActive: colors.brandPrimaryText,
    colorText: colors.textPrimary,
    colorTextHeading: colors.textHeading,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    colorBgLayout: colors.bgLayout,
    colorBgContainer: colors.bgContainer,
    colorBgElevated: colors.bgContainer,
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderSecondary,
    colorError: colors.error,
    colorErrorText: colors.errorText,
    colorErrorTextHover: colors.errorText,
    colorErrorTextActive: colors.errorText,
    colorSuccess: colors.success,
    colorSuccessText: colors.successText,
    colorSuccessTextHover: colors.successText,
    colorSuccessTextActive: colors.successText,
    colorWarning: colors.warning,
    colorWarningText: colors.warningText,
    colorWarningTextHover: colors.warningText,
    colorWarningTextActive: colors.warningText,
    colorInfoBg: colors.infoBg,

    borderRadius: 8,
    borderRadiusSM: 6,
    boxShadowTertiary: colors.boxShadow,

    sizeUnit: 4,
    sizeStep: 4,
    controlHeight: 32,
    controlHeightLG: 44,

    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: colors.siderBg,
      bodyBg: colors.bgContainer,
      headerBg: colors.bgContainer,
      triggerBg: colors.siderTrigger,
      headerHeight: 70,
      headerPadding: 0,
    },
    Button: {
      fontWeight: 600,
      defaultColor: colors.textPrimary,
    },
    Input: {
      inputFontSize: 16,
      inputFontSizeLG: 16,
    },
    Tabs: {
      cardGutter: 0,
      horizontalItemPadding: '8px 12px',
    },
    Form: {
      itemMarginBottom: 16,
    },
    Drawer: {
      paddingLG: 16,
    },
    Modal: {
      paddingContentHorizontalLG: 16,
    },
    Menu: {
      itemHeight: 44,
    },
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 8,
    },
  },
};

export default theme;
