import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Image, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, API_URL, ESPECIES } from '../../../config';

export default function EditMascotaScreen() {
  const router = useRouter();
  const { token, refreshMascotas } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [historial, setHistorial] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    especie?: string;
    raza?: string;
    edad?: string;
    general?: string;
  }>({});

  const fetchMascota = async () => {
    try {
      const response = await fetch(`${API_URL}/mascotas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNombre(data.nombre || '');
        setEspecie(data.especie || '');
        setRaza(data.raza || '');
        setEdad(String(data.edad || ''));
        setHistorial(data.historial_medico || '');
        setFoto(data.foto || null);
      }
    } catch (error) {
      console.error('Error al cargar mascota:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascota();
  }, []);

  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      // En web usamos input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadFoto(file);
      };
      input.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Necesitamos permisos para acceder a tu galería');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        await uploadFotoMobile(result.assets[0].uri);
      }
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      handlePickImage();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Necesitamos permisos para acceder a tu cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await uploadFotoMobile(result.assets[0].uri);
    }
  };

  const uploadFoto = async (file: File) => {
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const response = await fetch(`${API_URL}/upload/mascota/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setFoto(data.foto);
      } else {
        setErrors({ general: data.error || 'Error al subir foto' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión al subir foto' });
    } finally {
      setUploadingFoto(false);
    }
  };

  const uploadFotoMobile = async (uri: string) => {
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', {
        uri,
        type: 'image/jpeg',
        name: 'mascota.jpg',
      } as any);
      const response = await fetch(`${API_URL}/upload/mascota/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setFoto(data.foto);
      } else {
        setErrors({ general: data.error || 'Error al subir foto' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión al subir foto' });
    } finally {
      setUploadingFoto(false);
    }
  };

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

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/mascotas/${id}`, {
        method: 'PUT',
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
  await fetchMascota();
  setSuccess(true);
  setTimeout(() => {
    router.replace('/(tabs)/mascotas');
  }, 2000);
} else {
        setErrors({ general: data.error || 'Error al actualizar mascota' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const getMascotaIcon = (esp: string) => {
    switch (esp) {
      case 'Gato': return '🐱';
      case 'Ave': return '🐦';
      case 'Conejo': return '🐰';
      case 'Reptil': return '🦎';
      default: return '🐶';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Cargando mascota...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {/* Foto de mascota */}
          <View style={styles.fotoContainer}>
            {uploadingFoto ? (
              <ActivityIndicator size="large" color={COLORS.teal} />
            ) : foto ? (
              <Image source={{ uri: foto }} style={styles.fotoMascota} />
            ) : (
              <View style={styles.fotoPlaceholder}>
                <Text style={styles.fotoPlaceholderIcon}>{getMascotaIcon(especie)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>Editar — {nombre}</Text>
          <View style={styles.fotoButtons}>
            <TouchableOpacity style={styles.fotoBtn} onPress={handlePickImage}>
              <Text style={styles.fotoBtnText}>Galería</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.fotoBtn} onPress={handleTakePhoto}>
                <Text style={styles.fotoBtnText}>Cámara</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.waveLine} />
      </View>

      <View style={styles.form}>

        {errors.general && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ Mascota actualizada correctamente</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, errors.nombre ? styles.inputError : null]}
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
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: COLORS.teal, fontSize: 14, fontWeight: '500' },
  headerContent: { alignItems: 'center', paddingBottom: 12 },
  fotoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoMascota: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.teal,
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.teal,
    borderStyle: 'dashed',
  },
  fotoPlaceholderIcon: { fontSize: 40 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  fotoButtons: { flexDirection: 'row', gap: 10 },
  fotoBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fotoBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
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
  successBox: {
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successText: { color: COLORS.success, fontSize: 14, fontWeight: '500' },
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
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  especieText: { fontSize: 13, color: COLORS.text },
  especieTextActive: { color: COLORS.white, fontWeight: '500' },
  button: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});