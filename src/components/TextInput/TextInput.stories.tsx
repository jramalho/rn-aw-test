import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import TextInput from './index';
import { View, Text } from 'react-native';

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    mode: {
      control: 'select',
      options: ['outlined', 'flat'],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'your.email@example.com',
    helperText: 'We will never share your email with anyone',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    error: 'Password must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
  },
};

export const WithRightIcon: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <TextInput
        label="Password"
        placeholder="Enter password"
        secureTextEntry={!showPassword}
        rightIcon={
          <Text style={{ fontSize: 20 }}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        }
        onRightIconPress={() => setShowPassword(!showPassword)}
      />
    );
  },
};

export const MultilineInput: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    multiline: true,
    numberOfLines: 4,
    style: { height: 100, textAlignVertical: 'top' },
  },
};

export const EmailInput: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoComplete: 'email',
  },
};
