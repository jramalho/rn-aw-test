import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Pressable,
  useColorScheme,
} from 'react-native';
import { styles } from './styles';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  mode?: 'outlined' | 'flat';
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  rightIcon,
  onRightIconPress,
  style,
  disabled,
  mode: _mode = 'outlined',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const inputColor = isDarkMode ? '#ffffff' : '#000000';
  const placeholderColor = isDarkMode ? '#999999' : '#666666';
  const borderColor = isDarkMode ? '#444444' : '#cccccc';
  const backgroundColor = isDarkMode ? '#1c1c1e' : '#ffffff';
  const disabledOpacity = disabled ? 0.5 : 1;

  const hasError = typeof error === 'string' ? !!error : error;

  return (
    <View style={[styles.container, { opacity: disabledOpacity }]}>
      {label && (
        <Text style={[styles.label, { color: inputColor }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor, backgroundColor },
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <RNTextInput
          style={[styles.input, { color: inputColor }, style]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          {...rest}
        />
        {rightIcon && (
          <Pressable
            style={styles.iconContainer}
            onPress={onRightIconPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Toggle input visibility"
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {typeof error === 'string' && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {helperText && !hasError && (
        <Text style={[styles.helperText, { color: inputColor }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default TextInput;
