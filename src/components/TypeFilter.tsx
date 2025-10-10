import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Type } from '../types';
import { getPokemonTypeColor, capitalizeWords } from '../utils';

interface TypeFilterProps {
  types: Type[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ types, selectedType, onTypeSelect }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const containerBackgroundColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';

  const getAllTypesStyle = () => {
    const isSelected = selectedType === null;
    return {
      backgroundColor: isSelected ? '#007AFF' : (isDarkMode ? '#404040' : '#ffffff'),
      color: isSelected ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000'),
    };
  };

  const getTypeStyle = (type: Type) => {
    const isSelected = selectedType === type.name;
    const typeColor = getPokemonTypeColor(type.name);
    
    return {
      backgroundColor: isSelected ? typeColor : (isDarkMode ? '#404040' : '#ffffff'),
      color: isSelected ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000'),
    };
  };

  const allTypesStyle = getAllTypesStyle();

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Types Button */}
        <Pressable
          style={[
            styles.typeChip,
            selectedType === null && styles.selectedChip,
            { backgroundColor: allTypesStyle.backgroundColor },
          ]}
          onPress={() => onTypeSelect(null)}
        >
          <Text
            style={[
              styles.typeText,
              { color: allTypesStyle.color },
            ]}
          >
            All Types
          </Text>
        </Pressable>

        {/* Type Chips */}
        {types.map((type) => {
          const isSelected = selectedType === type.name;
          const typeStyle = getTypeStyle(type);

          return (
            <Pressable
              key={type.id}
              style={[
                styles.typeChip,
                isSelected && styles.selectedChip,
                { backgroundColor: typeStyle.backgroundColor },
              ]}
              onPress={() => onTypeSelect(type.name)}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: typeStyle.color },
                ]}
              >
                {capitalizeWords(type.name)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.05 }],
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TypeFilter;