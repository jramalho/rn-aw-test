import React from 'react';
import { View, ViewStyle, useColorScheme } from 'react-native';
import { styles } from './styles';

interface DividerProps {
  style?: ViewStyle;
}

const Divider: React.FC<DividerProps> = ({ style }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#38383A' : '#C6C6C8';

  return <View style={[styles.divider, { backgroundColor }, style]} />;
};

export default Divider;
