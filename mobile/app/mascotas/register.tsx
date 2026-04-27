import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL, ESPECIES } from '../../config';

export default function RegisterMascotaScreen() {
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
      const response = await fetch(`${API_URL}/mascotas`, {
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
        Alert.alert('✅ Mascota registrada', `${nombre} ha sido registrada correctamente.`, [
          { text: 'Aceptar', onPress: () => router.replace('/(tabs)/mascotas') },
        ]);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva mascota</Text>
        <Text style={styles.subtitle}>Registra los datos de tu mascota</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  scroll: { paddingBottom: 40 },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  form: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
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
  especieGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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