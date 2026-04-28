import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config';
import { Servicio } from '../../types';

export default function RegisterCitaScreen() {
  const router = useRouter();
  const { token, mascotas } = useAuth();
  const { mascotaId } = useLocalSearchParams<{ mascotaId?: string }>();

  const [selectedMascota, setSelectedMascota] = useState<string>(mascotaId || '');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showFecha, setShowFecha] = useState(false);
  const [showHora, setShowHora] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    mascota?: string;
    servicio?: string;
    motivo?: string;
    general?: string;
  }>({});

  const fetchServicios = async () => {
    try {
      const response = await fetch(`${API_URL}/servicios`);
      if (response.ok) {
        const data = await response.json();
        setServicios(data);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const formatFecha = (date: Date) => date.toISOString().split('T')[0];
  const formatHora = (date: Date) => date.toTimeString().split(' ')[0].substring(0, 5);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!selectedMascota) newErrors.mascota = 'Selecciona una mascota';
    if (!selectedServicio) newErrors.servicio = 'Selecciona un servicio';
    if (!motivo) newErrors.motivo = 'El motivo es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/citas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mascota_id: selectedMascota,
          fecha: formatFecha(fecha),
          hora: formatHora(hora),
          motivo,
          servicio: selectedServicio,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '✅ Cita solicitada',
          'Tu cita ha sido enviada. El equipo de Veterinaria Memo la confirmará pronto.',
          [{ text: 'Aceptar', onPress: () => router.replace('/(tabs)/citas') }]
        );
      } else {
        setErrors({ general: data.error || 'Error al registrar cita' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header blanco con logo */}
   <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
    <Text style={styles.backText}>← Volver</Text>
  </TouchableOpacity>
  <View style={styles.logoContainer}>
    <Image
      source={{ uri: 'https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png' }}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.title}>Solicitar cita</Text>
    <Text style={styles.subtitle}>Veterinaria Memo · Lunes a Sábado 7am-6pm</Text>
  </View>
  <View style={styles.waveLine} />
</View>

      <View style={styles.form}>

        {errors.general && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
          </View>
        )}

        {/* Selector de mascota */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🐾 Selecciona tu mascota</Text>
          <View style={styles.optionsGrid}>
            {mascotas.map((mascota) => (
              <TouchableOpacity
                key={mascota.id}
                style={[styles.optionBtn, selectedMascota === mascota.id && styles.optionBtnActive]}
                onPress={() => setSelectedMascota(mascota.id)}
              >
                <Text style={styles.optionIcon}>
                  {mascota.especie === 'Gato' ? '🐱' :
                   mascota.especie === 'Ave' ? '🐦' :
                   mascota.especie === 'Conejo' ? '🐰' : '🐶'}
                </Text>
                <Text style={[styles.optionText, selectedMascota === mascota.id && styles.optionTextActive]}>
                  {mascota.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.mascota && <Text style={styles.errorText}>{errors.mascota}</Text>}
        </View>

        {/* Selector de servicio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>💉 Tipo de servicio</Text>
          <View style={styles.optionsGrid}>
            {servicios.map((servicio) => (
              <TouchableOpacity
                key={servicio.id}
                style={[styles.optionBtn, selectedServicio === servicio.nombre && styles.optionBtnActive]}
                onPress={() => setSelectedServicio(servicio.nombre)}
              >
                <Text style={[styles.optionText, selectedServicio === servicio.nombre && styles.optionTextActive]}>
                  {servicio.nombre}
                </Text>
                <Text style={styles.optionDuracion}>⏱ {servicio.duracion_minutos} min</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.servicio && <Text style={styles.errorText}>{errors.servicio}</Text>}
        </View>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Fecha</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFecha(true)}>
            <Text style={styles.dateBtnText}>📅 {formatFecha(fecha)}</Text>
          </TouchableOpacity>
          {showFecha && (
            <DateTimePicker
              value={fecha}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowFecha(false);
                if (date) setFecha(date);
              }}
            />
          )}
        </View>

        {/* Hora */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>⏰ Hora</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowHora(true)}>
            <Text style={styles.dateBtnText}>⏰ {formatHora(hora)}</Text>
          </TouchableOpacity>
          {showHora && (
            <DateTimePicker
              value={hora}
              mode="time"
              is24Hour={true}
              onChange={(event, date) => {
                setShowHora(false);
                if (date) setHora(date);
              }}
            />
          )}
        </View>

        {/* Motivo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Motivo de la cita</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.motivo ? styles.inputError : null]}
            placeholder="Describe el motivo de la consulta..."
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.motivo && <Text style={styles.errorText}>{errors.motivo}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.buttonText}>Solicitar cita</Text>
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
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 4,
  },
 backText: { color: COLORS.teal, fontSize: 14, fontWeight: '500' },
  logoContainer: {
    alignItems: 'center',
  },
  logo: { width: 80, height: 80, marginBottom: 4 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  waveLine: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.teal,
    borderRadius: 2,
  },
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
  },
  optionBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  optionIcon: { fontSize: 20, marginBottom: 4 },
  optionText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  optionTextActive: { color: COLORS.white },
  optionDuracion: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  dateBtn: {
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.tealLight,
  },
  dateBtnText: { fontSize: 15, color: COLORS.teal, fontWeight: '500' },
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
  button: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});