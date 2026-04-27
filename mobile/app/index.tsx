import { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && token) {
      router.replace('/(tabs)');
    }
  }, [loading, token]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Sección superior */}
      <View style={styles.topSection}>
        <Image
          source={{ uri: 'https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Veterinaria Memo</Text>
        <Text style={styles.subtitle}>
          Nos enfocamos en el cuidado{'\n'}de la salud de tu mascota
        </Text>

        {/* Onda decorativa */}
        <View style={styles.wave} />
      </View>

      {/* Sección inferior */}
      <View style={styles.bottomSection}>
        <Text style={styles.tagline}>🐾 Un animal sano es un animal feliz</Text>

        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonPrimaryText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.buttonSecondaryText}>Crear cuenta nueva</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          📅 Lunes a Sábado · 7:00am – 6:00pm
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: COLORS.white,
    paddingBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: COLORS.teal,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  bottomSection: {
    padding: 30,
    paddingTop: 20,
    paddingBottom: 50,
    backgroundColor: COLORS.teal,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonSecondaryText: {
    color: COLORS.teal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontSize: 13,
  },
});