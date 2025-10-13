import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import type { ButtonProps } from '../../types';
import { styles } from './styles';

// Extended button props to support Paper-like features
interface ExtendedButtonProps extends ButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: string; // For compatibility, but we won't render icons
}

const Button: React.FC<ExtendedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  mode = 'contained',
  icon,
}) => {
  // Map Paper mode to our variant system
  const effectiveVariant = mode === 'contained' ? variant : 
                          mode === 'outlined' ? 'outline' : 
                          variant;

  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[size],
    styles[effectiveVariant],
    (disabled || loading) && styles.disabled,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    styles[`${effectiveVariant}Text` as keyof typeof styles] as TextStyle,
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
          color={effectiveVariant === 'primary' ? '#ffffff' : '#007AFF'} 
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;
