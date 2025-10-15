import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import Button from './index';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    mode: {
      control: 'select',
      options: ['text', 'outlined', 'contained', 'elevated', 'contained-tonal'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
  args: {
    title: 'Button',
    variant: 'primary',
    size: 'medium',
    mode: 'contained',
    disabled: false,
    loading: false,
    onPress: () => console.log('Button pressed'),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    title: 'Small Button',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading...',
    loading: true,
  },
};

export const Outlined: Story = {
  args: {
    title: 'Outlined Mode',
    mode: 'outlined',
  },
};
