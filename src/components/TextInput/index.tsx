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
  error?: string;
  helperText?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  rightIcon,
  onRightIconPress,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const inputColor = isDarkMode ? '#ffffff' : '#000000';
  const placeholderColor = isDarkMode ? '#999999' : '#666666';
  const borderColor = isDarkMode ? '#444444' : '#cccccc';
  const backgroundColor = isDarkMode ? '#1c1c1e' : '#ffffff';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: inputColor }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor, backgroundColor },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <RNTextInput
          style={[styles.input, { color: inputColor }, style]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <Pressable
            style={styles.iconContainer}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Toggle input visibility"
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {helperText && !error && (
        <Text style={[styles.helperText, { color: inputColor }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default TextInput;
