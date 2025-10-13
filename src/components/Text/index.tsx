import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { styles } from './styles';

type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

interface CustomTextProps extends RNTextProps {
  variant?: TextVariant;
  children?: React.ReactNode;
}

const Text: React.FC<CustomTextProps> = ({
  variant = 'bodyMedium',
  style,
  children,
  ...rest
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colorStyle: TextStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const variantStyle = styles[variant];

  return (
    <RNText style={[variantStyle, colorStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
