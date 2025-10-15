import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import Card from './index';
import Text from '../Text';
import { View } from 'react-native';

const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card>
      <Card.Content>
        <Text>This is a basic card with simple content.</Text>
      </Card.Content>
    </Card>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Card>
      <Card.Title title="Card Title" />
      <Card.Content>
        <Text>
          This card includes a title section along with content.
        </Text>
      </Card.Content>
    </Card>
  ),
};

export const FullExample: Story = {
  render: () => (
    <Card>
      <Card.Title title="Pokemon Card" />
      <Card.Content>
        <Text variant="titleMedium">Pikachu</Text>
        <Text variant="bodyMedium">Type: Electric</Text>
        <Text variant="bodySmall">
          Pikachu is an Electric-type Pokémon introduced in Generation I.
        </Text>
      </Card.Content>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <View>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="First Card" />
        <Card.Content>
          <Text>Content for the first card</Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Second Card" />
        <Card.Content>
          <Text>Content for the second card</Text>
        </Card.Content>
      </Card>
      <Card>
        <Card.Title title="Third Card" />
        <Card.Content>
          <Text>Content for the third card</Text>
        </Card.Content>
      </Card>
    </View>
  ),
};
