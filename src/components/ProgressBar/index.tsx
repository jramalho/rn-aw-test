import React from 'react';
import { View, ViewStyle, useColorScheme } from 'react-native';
import { styles } from './styles';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  style,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#38383A' : '#E5E5EA';
  const fillColor = color || '#007AFF';
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: fillColor, width: `${clampedProgress * 100}%` },
        ]}
      />
    </View>
  );
};

export default ProgressBar;
