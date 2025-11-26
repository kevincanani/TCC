import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Objeto global para controlar o Alert
export const AlertCustom = {
  alert: (title, message, buttons = [{ text: 'OK' }]) => {
    console.warn('AlertCustom não está montado. Envolva seu app com <AlertProvider>');
  }
};

// Provider que deve envolver sua aplicação
export const AlertProvider = ({ children }) => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState({
    title: '',
    message: '',
    buttons: []
  });

  React.useEffect(() => {
    // Sobrescreve a função alert do objeto global
    AlertCustom.alert = (title, message, buttons = [{ text: 'OK' }]) => {
      console.log('📢 AlertCustom.alert chamado:', { title, message });
      setConfig({ title, message, buttons });
      setVisible(true);
    };

    return () => {
      AlertCustom.alert = () => {
        console.warn('AlertCustom foi desmontado');
      };
    };
  }, []);

  const handlePress = (onPress) => {
    console.log('🔘 Botão do alert pressionado');
    setVisible(false);
    setTimeout(() => {
      if (onPress) onPress();
    }, 100);
  };

  const handleBackdrop = () => {
    // Fecha o alert ao clicar fora (opcional)
    const cancelButton = config.buttons.find(b => b.style === 'cancel');
    if (cancelButton) {
      handlePress(cancelButton.onPress);
    }
  };

  return (
    <>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={handleBackdrop}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleBackdrop}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.alertBox}>
              {config.title && (
                <Text style={styles.title}>{config.title}</Text>
              )}
              {config.message && (
                <Text style={styles.message}>{config.message}</Text>
              )}
              <View style={[
                styles.buttonContainer,
                config.buttons.length === 1 && styles.singleButton
              ]}>
                {config.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      config.buttons.length === 1 && styles.fullWidthButton
                    ]}
                    onPress={() => handlePress(button.onPress)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  singleButton: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6B7280',
  },
});