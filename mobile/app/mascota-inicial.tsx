import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS, ESPECIES } from '../config';
import { StatusBar } from 'expo-status-bar';

export default function MascotaInicialScreen() {
  const router = useRouter();
  const { token, refreshMascotas } = useAuth();
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [historial, setHistorial] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    especie?: string;
    raza?: string;
    edad?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!especie) newErrors.especie = 'La especie es obligatoria';
    if (!raza) newErrors.raza = 'La raza es obligatoria';
    if (!edad) newErrors.edad = 'La edad es obligatoria';
    else if (isNaN(Number(edad)) || Number(edad) < 0) newErrors.edad = 'Edad inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistrar = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch('https://veterinaria-memo.vercel.app/api/mascotas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          especie,
          raza: raza.trim(),
          edad: Number(edad),
          historial_medico: historial.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await refreshMascotas();
        router.replace('/(tabs)');
      } else {
        setErrors({ general: data.error || 'Error al registrar mascota' });
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
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.headerIcon}>🐶</Text>
          <Text style={styles.headerTitle}>Registra tu mascota</Text>
          <Text style={styles.headerSubtitle}>
            Antes de continuar, cuéntanos sobre tu mascota
          </Text>
        </View>

        <View style={styles.form}>

          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la mascota</Text>
            <TextInput
              style={[styles.input, errors.nombre ? styles.inputError : null]}
              placeholder="¿Cómo se llama?"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especie</Text>
            <View style={styles.especieGrid}>
              {ESPECIES.map((esp) => (
                <TouchableOpacity
                  key={esp}
                  style={[styles.especieBtn, especie === esp && styles.especieBtnActive]}
                  onPress={() => setEspecie(esp)}
                >
                  <Text style={[styles.especieText, especie === esp && styles.especieTextActive]}>
                    {esp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.especie && <Text style={styles.errorText}>{errors.especie}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raza</Text>
            <TextInput
              style={[styles.input, errors.raza ? styles.inputError : null]}
              placeholder="Ej: Labrador, Siamés..."
              value={raza}
              onChangeText={setRaza}
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.raza && <Text style={styles.errorText}>{errors.raza}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Edad (años)</Text>
            <TextInput
              style={[styles.input, errors.edad ? styles.inputError : null]}
              placeholder="Ej: 3"
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.edad && <Text style={styles.errorText}>{errors.edad}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Historial médico (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alergias, condiciones, vacunas..."
              value={historial}
              onChangeText={setHistorial}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegistrar}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.buttonText}>Registrar mascota</Text>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  headerIcon: { fontSize: 50, marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingTop: 35,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: { color: COLORS.danger, fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.grayLight,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  especieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  especieBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.grayLight,
  },
  especieBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  especieText: { fontSize: 13, color: COLORS.text },
  especieTextActive: { color: COLORS.white, fontWeight: '500' },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});