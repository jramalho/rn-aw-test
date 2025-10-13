import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { styles } from './styles';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  titleStyle?: TextStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const Card: React.FC<CardProps> & {
  Title: React.FC<CardTitleProps>;
  Content: React.FC<CardContentProps>;
} = ({ children, style, title, titleStyle }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#1c1c1e' : '#ffffff';

  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      {title && (
        <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }, titleStyle]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }, style]}>
      {children}
    </Text>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <Text style={[styles.content, { color: isDarkMode ? '#ffffff' : '#000000' }, style]}>
      {children}
    </Text>
  );
};

Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
export { CardTitle, CardContent };
