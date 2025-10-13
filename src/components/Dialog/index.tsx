import React from 'react';
import { Modal, View, Pressable, ViewStyle, useColorScheme } from 'react-native';
import Text from '../Text';
import Button from '../Button';
import { styles } from './styles';

interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
}

interface DialogActionsProps {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> & {
  Title: React.FC<DialogTitleProps>;
  Content: React.FC<DialogContentProps>;
  Actions: React.FC<DialogActionsProps>;
} = ({ visible, onDismiss, children, style }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.dialog, { backgroundColor }, style]}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <View style={styles.title}>
    <Text variant="headlineSmall">{children}</Text>
  </View>
);

const DialogContent: React.FC<DialogContentProps> = ({ children }) => (
  <View style={styles.content}>{children}</View>
);

const DialogActions: React.FC<DialogActionsProps> = ({ children }) => (
  <View style={styles.actions}>{children}</View>
);

Dialog.Title = DialogTitle;
Dialog.Content = DialogContent;
Dialog.Actions = DialogActions;

export default Dialog;
