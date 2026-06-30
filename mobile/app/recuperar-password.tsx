import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, API_URL } from '../config';
import { StatusBar } from 'expo-status-bar';

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!email) {
      setErrors({ email: 'El correo es obligatorio' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Correo inválido' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnviado(true);
      } else {
        setErrors({ general: data.error || 'Error al enviar correo' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Veterinaria Memo</Text>
        </View>

        <View style={styles.wave} />

        <View style={styles.form}>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos un código</Text>

          {enviado ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Código enviado a tu correo. Revisa tu bandeja de entrada.</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/reset-password')}
              >
                <Text style={styles.buttonText}>Ingresar código</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {errors.general && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="tucorreo@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={COLORS.textSecondary}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleEnviar}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.buttonText}>Enviar código</Text>
                }
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver al login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logo: { width: 130, height: 130, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  wave: {
    height: 30,
    backgroundColor: COLORS.teal,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  form: {
    flex: 1,
    backgroundColor: COLORS.teal,
    padding: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: { color: COLORS.danger, fontSize: 14 },
  successBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  successText: { color: COLORS.white, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.white, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.dangerLight, fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
});