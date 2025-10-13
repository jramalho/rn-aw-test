import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { ButtonProps } from '../../types';
import { styles } from './styles';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[size],
    styles[variant],
    (disabled || loading) && styles.disabled,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    (disabled || loading) && styles.disabledText,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && !loading && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#ffffff' : '#007AFF'} 
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;
