import React from 'react';
import { View, ViewStyle, useColorScheme } from 'react-native';
import { styles } from './styles';
import Text from '../Text';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  title?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

interface CardContentProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> & {
  Title: React.FC<CardTitleProps>;
  Content: React.FC<CardContentProps>;
} = ({ children, style }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#1c1c1e' : '#ffffff';

  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.titleContainer, style]}>
      <Text variant="titleLarge">{title || children}</Text>
    </View>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={[styles.contentContainer, style]}>
      {children}
    </View>
  );
};

Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
export { CardTitle, CardContent };
