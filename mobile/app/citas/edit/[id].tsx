import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, API_URL } from '../../../config';
import { Servicio } from '../../../types';

export default function EditCitaScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedServicio, setSelectedServicio] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showFecha, setShowFecha] = useState(false);
  const [showHora, setShowHora] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    servicio?: string;
    motivo?: string;
    general?: string;
  }>({});

  const fetchCita = async () => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedServicio(data.servicio || '');
        setMotivo(data.motivo || '');
        const [year, month, day] = data.fecha.split('-');
        const fechaDate = new Date(Number(year), Number(month) - 1, Number(day));
        setFecha(fechaDate);
        const [hh, mm] = data.hora.split(':');
        const horaDate = new Date();
        horaDate.setHours(Number(hh), Number(mm));
        setHora(horaDate);
      }
    } catch (error) {
      console.error('Error al cargar cita:', error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchCita();
    fetchServicios();
  }, []);

  const formatFecha = (date: Date) => date.toISOString().split('T')[0];
  const formatHora = (date: Date) => date.toTimeString().split(' ')[0].substring(0, 5);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!selectedServicio) newErrors.servicio = 'Selecciona un servicio';
    if (!motivo) newErrors.motivo = 'El motivo es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/citas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: formatFecha(fecha),
          hora: formatHora(hora),
          motivo,
          servicio: selectedServicio,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ Cita actualizada', 'Tu cita ha sido actualizada correctamente.', [
          { text: 'Aceptar', onPress: () => router.replace('/(tabs)/citas') },
        ]);
      } else {
        setErrors({ general: data.error || 'Error al actualizar cita' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando cita...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar cita</Text>
      </View>

      <View style={styles.form}>

        {errors.general && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
          </View>
        )}

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
              </TouchableOpacity>
            ))}
          </View>
          {errors.servicio && <Text style={styles.errorText}>{errors.servicio}</Text>}
        </View>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Fecha</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFecha(true)}>
            <Text style={styles.dateBtnText}>{formatFecha(fecha)}</Text>
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
            <Text style={styles.dateBtnText}>{formatHora(hora)}</Text>
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
          <Text style={styles.label}>📝 Motivo</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.motivo ? styles.inputError : null]}
            placeholder="Describe el motivo..."
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.motivo && <Text style={styles.errorText}>{errors.motivo}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.buttonText}>Guardar cambios</Text>
          }
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  scroll: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
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
  },
  optionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  optionTextActive: { color: COLORS.white },
  dateBtn: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.grayLight,
  },
  dateBtnText: { fontSize: 15, color: COLORS.text },
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
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});