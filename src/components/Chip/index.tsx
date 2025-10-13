import React from 'react';
import { Pressable, ViewStyle, useColorScheme } from 'react-native';
import Text from '../Text';
import { styles } from './styles';

interface ChipProps {
  children?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  mode?: 'flat' | 'outlined';
}

const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  onPress,
  style,
  mode = 'flat',
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = selected
    ? '#007AFF'
    : isDarkMode
    ? '#1C1C1E'
    : '#F2F2F7';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        mode === 'outlined' && styles.outlined,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Text
        variant="labelMedium"
        style={[
          styles.text,
          { color: selected ? '#FFFFFF' : isDarkMode ? '#FFFFFF' : '#000000' },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export default Chip;
