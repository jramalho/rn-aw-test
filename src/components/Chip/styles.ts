import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  text: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
