import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pokemonImage: {
    width: 70,
    height: 70,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  teamButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  teamButtonActive: {
    backgroundColor: '#22c55e',
  },
  teamButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
