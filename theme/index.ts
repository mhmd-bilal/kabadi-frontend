import { Theme, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { COLORS } from './colors';

const customFonts = {
  regular: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
  semibold: {
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
  },
  bold: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  heavy: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
};

const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: COLORS.light.background,
      border: COLORS.light.grey5,
      card: COLORS.light.card,
      notification: COLORS.light.destructive,
      primary: COLORS.light.primary,
      text: COLORS.black,
    },
    fonts: customFonts,
  },
  dark: {
    dark: true,
    colors: {
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
    fonts: customFonts,
  },
};

export { NAV_THEME };
