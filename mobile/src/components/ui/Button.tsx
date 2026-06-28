import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'default' | 'outline' | 'ghost';
  loading?: boolean;
}

export const Button = ({ title, variant = 'default', loading = false, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'default' && styles.default,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        props.disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'default' ? '#fff' : '#000'} />
      ) : (
        <Text
          style={[
            styles.textBase,
            variant === 'default' && styles.textDefault,
            variant === 'outline' && styles.textOutline,
            variant === 'ghost' && styles.textGhost,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 54, // Increased height
    borderRadius: 0, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  default: {
    backgroundColor: '#09090b',
    borderColor: '#09090b',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#e4e4e7',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '700',
  },
  textDefault: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#09090b',
  },
  textGhost: {
    color: '#09090b',
  },
});
