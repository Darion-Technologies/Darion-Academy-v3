import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface InputProps extends TextInputProps {
  isPassword?: boolean;
  error?: string;
}

export const Input = ({ isPassword, error, style, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          error ? styles.errorBorder : null,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="#a1a1aa"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54, // Increased height
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f4f4f5', // Subtle gray background
  },
  focused: {
    borderColor: '#09090b', // Sharp black border on focus
    backgroundColor: '#ffffff',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16, // Increased padding
    fontSize: 16,
    color: '#09090b',
  },
  eyeIcon: {
    padding: 16,
  },
});
