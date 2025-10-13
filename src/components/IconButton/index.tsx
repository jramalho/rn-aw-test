import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Text from '../Text';
import { styles } from './styles';

interface IconButtonProps {
  icon: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 24,
  color = '#007AFF',
  onPress,
  style,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { width: size + 16, height: size + 16 },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={icon}
    >
      {/* Since we don't have icons, show icon name as text */}
      <Text variant="labelSmall" style={{ color, fontSize: size * 0.5 }}>
        {icon.slice(0, 1).toUpperCase()}
      </Text>
    </Pressable>
  );
};

export default IconButton;
