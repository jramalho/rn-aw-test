import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Type } from '../../types';
import { getPokemonTypeColor, capitalizeWords } from '../../utils';
import { styles } from './styles';

interface TypeFilterProps {
  types: Type[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({
  types,
  selectedType,
  onTypeSelect,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const containerBackgroundColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';

  const getAllTypesStyle = () => {
    const isSelected = selectedType === null;
    return {
      backgroundColor: isSelected
        ? '#007AFF'
        : isDarkMode
        ? '#404040'
        : '#ffffff',
      color: isSelected ? '#ffffff' : isDarkMode ? '#ffffff' : '#000000',
    };
  };

  const getTypeStyle = (type: Type) => {
    const isSelected = selectedType === type.name;
    const typeColor = getPokemonTypeColor(type.name);

    return {
      backgroundColor: isSelected
        ? typeColor
        : isDarkMode
        ? '#404040'
        : '#ffffff',
      color: isSelected ? '#ffffff' : isDarkMode ? '#ffffff' : '#000000',
    };
  };

  const allTypesStyle = getAllTypesStyle();

  return (
    <View
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessible={true}
        accessibilityLabel="Pokémon type filter"
        accessibilityHint="Scroll horizontally to view and select different Pokémon types"
      >
        {/* All Types Button */}
        <Pressable
          style={[
            styles.typeChip,
            selectedType === null && styles.selectedChip,
            { backgroundColor: allTypesStyle.backgroundColor },
          ]}
          onPress={() => onTypeSelect(null)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="All Types filter"
          accessibilityHint="Double tap to show all Pokémon types"
          accessibilityState={{ selected: selectedType === null }}
        >
          <Text style={[styles.typeText, { color: allTypesStyle.color }]}>
            All Types
          </Text>
        </Pressable>

        {/* Type Chips */}
        {types.map(type => {
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
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${capitalizeWords(type.name)} type filter`}
              accessibilityHint={`Double tap to show only ${type.name} type Pokémon`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.typeText, { color: typeStyle.color }]}>
                {capitalizeWords(type.name)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TypeFilter;
