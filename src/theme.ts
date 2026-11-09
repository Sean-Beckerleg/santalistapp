import { Platform } from 'react-native';

export const colors = {
  red: '#b3261e',
  green: '#2f5d46',
  parch: '#e9d4a6',
  parch2: '#d9bd85',
  ink: '#7a1c14',
  bg: '#173a2e',
  brown: '#3b2410',
  cream: '#fff8e6',
};
export const serif = Platform.select({ ios: 'Georgia', default: 'serif' });
