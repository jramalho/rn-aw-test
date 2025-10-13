import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByText } = render(
        <Button title="Click Me" onPress={jest.fn()} />,
      );

      expect(getByText('Click Me')).toBeTruthy();
    });

    it('renders with different variants', () => {
      const { rerender, getByText } = render(
        <Button title="Primary" onPress={jest.fn()} variant="primary" />,
      );
      expect(getByText('Primary')).toBeTruthy();

      rerender(
        <Button title="Secondary" onPress={jest.fn()} variant="secondary" />,
      );
      expect(getByText('Secondary')).toBeTruthy();

      rerender(
        <Button title="Outline" onPress={jest.fn()} variant="outline" />,
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('renders with different sizes', () => {
      const { rerender, getByText } = render(
        <Button title="Small" onPress={jest.fn()} size="small" />,
      );
      expect(getByText('Small')).toBeTruthy();

      rerender(<Button title="Medium" onPress={jest.fn()} size="medium" />);
      expect(getByText('Medium')).toBeTruthy();

      rerender(<Button title="Large" onPress={jest.fn()} size="large" />);
      expect(getByText('Large')).toBeTruthy();
    });

    it('shows loading indicator when loading prop is true', () => {
      const { queryByText, UNSAFE_getByType } = render(
        <Button title="Loading" onPress={jest.fn()} loading={true} />,
      );

      // Title should not be visible when loading
      expect(queryByText('Loading')).toBeNull();

      // ActivityIndicator should be present
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Press Me" onPress={onPressMock} />,
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Disabled" onPress={onPressMock} disabled={true} />,
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const { UNSAFE_getByType } = render(
        <Button title="Loading" onPress={onPressMock} loading={true} />,
      );

      const { Pressable } = require('react-native');
      const pressable = UNSAFE_getByType(Pressable);
      fireEvent.press(pressable);

      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role', () => {
      const { getByRole } = render(
        <Button title="Accessible" onPress={jest.fn()} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('has proper accessibility label', () => {
      const { getByLabelText } = render(
        <Button title="Test Button" onPress={jest.fn()} />,
      );

      expect(getByLabelText('Test Button')).toBeTruthy();
    });

    it('has proper accessibility state when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={jest.fn()} disabled={true} />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    it('has proper accessibility state when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={jest.fn()} loading={true} />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      const { getByText } = render(<Button title="" onPress={jest.fn()} />);

      expect(getByText('')).toBeTruthy();
    });

    it('handles multiple rapid presses correctly', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Rapid" onPress={onPressMock} />,
      );

      const button = getByText('Rapid');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });

    it('handles variant and size combinations', () => {
      const { getByText } = render(
        <Button
          title="Complex"
          onPress={jest.fn()}
          variant="secondary"
          size="large"
        />,
      );

      expect(getByText('Complex')).toBeTruthy();
    });
  });
});
