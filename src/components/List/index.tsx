import React from 'react';
import { View, Pressable, ViewStyle, useColorScheme } from 'react-native';
import Text from '../Text';
import { styles } from './styles';

interface ListItemProps {
  title: string;
  description?: string;
  onPress?: () => void;
  left?: () => React.ReactNode;
  right?: () => React.ReactNode;
  style?: ViewStyle;
}

interface ListSectionProps {
  children: React.ReactNode;
  title?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  onPress,
  left,
  right,
  style,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
        style,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {left && <View style={styles.left}>{left()}</View>}
      <View style={styles.content}>
        <Text variant="bodyLarge">{title}</Text>
        {description && (
          <Text variant="bodySmall" style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      {right && <View style={styles.right}>{right()}</View>}
    </Pressable>
  );
};

const ListSection: React.FC<ListSectionProps> = ({ children, title }) => {
  return (
    <View style={styles.section}>
      {title && (
        <View style={styles.sectionHeader}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
};

const List = {
  Item: ListItem,
  Section: ListSection,
};

export default List;
