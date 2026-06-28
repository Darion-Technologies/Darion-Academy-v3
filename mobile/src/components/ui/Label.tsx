import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

export const Label = ({ children, style, ...props }: TextProps) => {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '700', // Bolder
    color: '#09090b',
    marginBottom: 4, // Tighter coupling to input
  },
});
