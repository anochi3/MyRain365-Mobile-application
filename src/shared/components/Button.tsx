import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  label: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
  showArrow?: boolean;
}

export default function Button({ label, variant, onPress, showArrow = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        style.button,
        style[variant],
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[style.text, style[`${variant}Text`]]}>
        {label}
      </Text>
      {showArrow && (
          <MaterialCommunityIcons name="arrow-right-thin" size={24}color={variant === 'primary' ? '#FFFFFF' : '#245581'} />
        )}
    </Pressable>
  );
}

const style = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  primary: {
    backgroundColor: '#245581',
    borderColor: '#245581',
  },
  secondary: {
    backgroundColor: '#F5F0E6',
    borderColor: '#245581',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#245581',
  },
});