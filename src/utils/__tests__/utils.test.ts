import {
  capitalize,
  capitalizeWords,
  formatPokemonName,
  truncate,
  clamp,
  formatHeight,
  formatWeight,
  formatPokemonId,
  getStatPercentage,
  getPokemonTypeColor,
  getStatColor,
  hexToRgba,
  isValidEmail,
  isValidPhone,
  uniqueBy,
  groupBy,
  getPokemonImageUrl,
  getPokemonIdFromUrl,
  filterPokemonsByType,
  sortPokemonsByName,
  sortPokemonsByNumber,
  debounce,
  throttle,
  buildPokemonApiUrl,
  createCacheKey,
  formatDate,
  getTimeAgo,
} from '../index';

describe('Utility Functions', () => {
  describe('String utilities', () => {
    describe('capitalize', () => {
      it('capitalizes first letter of string', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('WORLD')).toBe('World');
        expect(capitalize('tEsT')).toBe('Test');
      });

      it('handles empty string', () => {
        expect(capitalize('')).toBe('');
      });

      it('handles single character', () => {
        expect(capitalize('a')).toBe('A');
      });
    });

    describe('capitalizeWords', () => {
      it('capitalizes all words', () => {
        expect(capitalizeWords('hello world')).toBe('Hello World');
        expect(capitalizeWords('react native app')).toBe('React Native App');
      });

      it('handles single word', () => {
        expect(capitalizeWords('hello')).toBe('Hello');
      });

      it('handles empty string', () => {
        expect(capitalizeWords('')).toBe('');
      });
    });

    describe('formatPokemonName', () => {
      it('formats pokemon names with hyphens', () => {
        expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
        expect(formatPokemonName('ho-oh')).toBe('Ho Oh');
      });

      it('handles names without hyphens', () => {
        expect(formatPokemonName('pikachu')).toBe('Pikachu');
      });

      it('handles multiple hyphens', () => {
        expect(formatPokemonName('porygon-z')).toBe('Porygon Z');
      });
    });

    describe('truncate', () => {
      it('truncates long strings', () => {
        expect(truncate('This is a very long string', 10)).toBe('This is a ...');
      });

      it('does not truncate short strings', () => {
        expect(truncate('Short', 10)).toBe('Short');
      });

      it('handles exact length', () => {
        expect(truncate('Exactly', 7)).toBe('Exactly');
      });
    });
  });

  describe('Number utilities', () => {
    describe('clamp', () => {
      it('clamps value within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
      });

      it('handles equal min and max', () => {
        expect(clamp(5, 10, 10)).toBe(10);
      });
    });

    describe('formatHeight', () => {
      it('formats height from decimeters to meters', () => {
        expect(formatHeight(10)).toBe('1.0 m');
        expect(formatHeight(25)).toBe('2.5 m');
        expect(formatHeight(5)).toBe('0.5 m');
      });
    });

    describe('formatWeight', () => {
      it('formats weight from hectograms to kilograms', () => {
        expect(formatWeight(100)).toBe('10.0 kg');
        expect(formatWeight(250)).toBe('25.0 kg');
        expect(formatWeight(5)).toBe('0.5 kg');
      });
    });

    describe('formatPokemonId', () => {
      it('formats pokemon ID with leading zeros', () => {
        expect(formatPokemonId(1)).toBe('#001');
        expect(formatPokemonId(25)).toBe('#025');
        expect(formatPokemonId(150)).toBe('#150');
        expect(formatPokemonId(1000)).toBe('#1000');
      });
    });

    describe('getStatPercentage', () => {
      it('calculates percentage correctly', () => {
        expect(getStatPercentage(100, 255)).toBe(39);
        expect(getStatPercentage(255, 255)).toBe(100);
        expect(getStatPercentage(0, 255)).toBe(0);
      });

      it('uses default max value of 255', () => {
        expect(getStatPercentage(127)).toBe(50);
      });
    });
  });

  describe('Color utilities', () => {
    describe('hexToRgba', () => {
      it('converts hex to rgba', () => {
        expect(hexToRgba('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
        expect(hexToRgba('#00FF00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
        expect(hexToRgba('#0000FF', 0)).toBe('rgba(0, 0, 255, 0)');
      });
    });

    describe('getPokemonTypeColor', () => {
      it('returns correct color for each type', () => {
        expect(getPokemonTypeColor('fire')).toBe('#F08030');
        expect(getPokemonTypeColor('water')).toBe('#6890F0');
        expect(getPokemonTypeColor('electric')).toBe('#F8D030');
      });

      it('handles case insensitivity', () => {
        expect(getPokemonTypeColor('FIRE')).toBe('#F08030');
        expect(getPokemonTypeColor('Water')).toBe('#6890F0');
      });

      it('returns default color for unknown type', () => {
        expect(getPokemonTypeColor('unknown')).toBe('#68A090');
      });
    });

    describe('getStatColor', () => {
      it('returns correct color for each stat', () => {
        expect(getStatColor('hp')).toBe('#FF5959');
        expect(getStatColor('attack')).toBe('#F5AC78');
        expect(getStatColor('defense')).toBe('#FAE078');
      });

      it('returns default color for unknown stat', () => {
        expect(getStatColor('unknown')).toBe('#A0A0A0');
      });
    });
  });

  describe('Validation utilities', () => {
    describe('isValidEmail', () => {
      it('validates correct emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      });

      it('rejects invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('validates correct phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true);
        expect(isValidPhone('1234567890')).toBe(true);
      });

      it('rejects invalid phone numbers', () => {
        expect(isValidPhone('abc')).toBe(false);
        expect(isValidPhone('')).toBe(false);
        expect(isValidPhone('01234567890')).toBe(false); // starts with 0
      });
    });
  });

  describe('Array utilities', () => {
    describe('uniqueBy', () => {
      it('removes duplicates by key', () => {
        const items = [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' },
          { id: 1, name: 'C' },
        ];
        
        const result = uniqueBy(items, 'id');
        
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: 1, name: 'A' });
        expect(result[1]).toEqual({ id: 2, name: 'B' });
      });
    });

    describe('groupBy', () => {
      it('groups items by key', () => {
        const items = [
          { type: 'fire', name: 'Charizard' },
          { type: 'water', name: 'Blastoise' },
          { type: 'fire', name: 'Arcanine' },
        ];
        
        const result = groupBy(items, 'type');
        
        expect(result.fire).toHaveLength(2);
        expect(result.water).toHaveLength(1);
        expect(result.fire[0].name).toBe('Charizard');
      });
    });
  });

  describe('Pokemon utilities', () => {
    describe('getPokemonImageUrl', () => {
      it('returns default image URL', () => {
        expect(getPokemonImageUrl(25)).toContain('pokemon/25.png');
      });

      it('returns shiny variant URL', () => {
        expect(getPokemonImageUrl(25, 'shiny')).toContain('pokemon/shiny/25.png');
      });

      it('returns artwork variant URL', () => {
        expect(getPokemonImageUrl(25, 'artwork')).toContain('official-artwork/25.png');
      });
    });

    describe('getPokemonIdFromUrl', () => {
      it('extracts ID from URL', () => {
        expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
        expect(getPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/150/')).toBe(150);
      });

      it('returns 0 for invalid URL', () => {
        expect(getPokemonIdFromUrl('invalid')).toBe(0);
      });
    });

    describe('filterPokemonsByType', () => {
      const mockPokemons = [
        { id: 1, types: [{ type: { name: 'fire' } }] },
        { id: 2, types: [{ type: { name: 'water' } }] },
        { id: 3, types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }] },
      ];

      it('filters by type correctly', () => {
        const result = filterPokemonsByType(mockPokemons, 'fire');
        expect(result).toHaveLength(2);
      });

      it('returns all when no filter', () => {
        const result = filterPokemonsByType(mockPokemons, '');
        expect(result).toHaveLength(3);
      });

      it('handles case insensitivity', () => {
        const result = filterPokemonsByType(mockPokemons, 'FIRE');
        expect(result).toHaveLength(2);
      });
    });

    describe('sortPokemonsByName', () => {
      it('sorts alphabetically', () => {
        const pokemons = [
          { name: 'charizard' },
          { name: 'blastoise' },
          { name: 'arcanine' },
        ];
        
        const result = sortPokemonsByName(pokemons);
        
        expect(result[0].name).toBe('arcanine');
        expect(result[1].name).toBe('blastoise');
        expect(result[2].name).toBe('charizard');
      });
    });

    describe('sortPokemonsByNumber', () => {
      it('sorts by ID', () => {
        const pokemons = [
          { id: 150 },
          { id: 25 },
          { id: 1 },
        ];
        
        const result = sortPokemonsByNumber(pokemons);
        
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(25);
        expect(result[2].id).toBe(150);
      });
    });
  });

  describe('Performance utilities', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    describe('debounce', () => {
      it('debounces function calls', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);
        
        debouncedFn(1);
        debouncedFn(2);
        debouncedFn(3);
        
        expect(fn).not.toHaveBeenCalled();
        
        jest.advanceTimersByTime(500);
        
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
      });
    });

    describe('throttle', () => {
      it('throttles function calls', () => {
        const fn = jest.fn();
        const throttledFn = throttle(fn, 500);
        
        throttledFn(1);
        throttledFn(2);
        throttledFn(3);
        
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(1);
        
        jest.advanceTimersByTime(500);
        
        throttledFn(4);
        
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenCalledWith(4);
      });
    });
  });

  describe('API utilities', () => {
    describe('buildPokemonApiUrl', () => {
      it('builds URL without params', () => {
        expect(buildPokemonApiUrl('pokemon')).toBe('https://pokeapi.co/api/v2/pokemon');
      });

      it('builds URL with params', () => {
        const url = buildPokemonApiUrl('pokemon', { limit: 20, offset: 0 });
        expect(url).toContain('limit=20');
        expect(url).toContain('offset=0');
      });
    });

    describe('createCacheKey', () => {
      it('creates cache key from parts', () => {
        expect(createCacheKey('pokemon', 25)).toBe('pokemon:25');
        expect(createCacheKey('list', 'fire', 1)).toBe('list:fire:1');
      });
    });
  });

  describe('Date utilities', () => {
    describe('formatDate', () => {
      it('formats date in short format', () => {
        const date = new Date('2024-01-15');
        const result = formatDate(date, 'short');
        expect(result).toContain('2024');
      });

      it('formats date in long format', () => {
        const date = new Date('2024-01-15');
        const result = formatDate(date, 'long');
        expect(result).toContain('January');
        expect(result).toContain('2024');
      });

      it('handles string dates', () => {
        const result = formatDate('2024-01-15', 'short');
        expect(result).toContain('2024');
      });
    });

    describe('getTimeAgo', () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('returns "just now" for recent dates', () => {
        const date = new Date('2024-01-15T11:59:50Z');
        expect(getTimeAgo(date)).toBe('just now');
      });

      it('returns minutes ago', () => {
        const date = new Date('2024-01-15T11:55:00Z');
        expect(getTimeAgo(date)).toBe('5m ago');
      });

      it('returns hours ago', () => {
        const date = new Date('2024-01-15T10:00:00Z');
        expect(getTimeAgo(date)).toBe('2h ago');
      });

      it('returns days ago', () => {
        const date = new Date('2024-01-13T12:00:00Z');
        expect(getTimeAgo(date)).toBe('2d ago');
      });
    });
  });
});
