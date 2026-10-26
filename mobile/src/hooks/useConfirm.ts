import { useCallback } from 'react';
import { Alert } from 'react-native';

type ConfirmOptions = {
  title: string;
  message?: string;
  danger?: boolean;
  confirmLabel?: string;
};

export function useConfirm() {
  return useCallback(({ title, message, danger = true, confirmLabel = 'Confirm' }: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: danger ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ]);
    });
  }, []);
}
