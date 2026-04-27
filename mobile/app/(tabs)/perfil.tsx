import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config';

export default function PerfilScreen() {
  const { usuario, token, logout } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    general?: string;
    success?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!email) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Correo inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, email, telefono }),
      });

      const data = await response.json();

      if (response.ok) {
        setErrors({ success: '✅ Perfil actualizado correctamente' });
      } else {
        setErrors({ general: data.error || 'Error al actualizar' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción eliminará tu cuenta y todas tus mascotas y citas. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/delete`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response.ok) {
                await logout();
              } else {
                Alert.alert('Error', 'No se pudo eliminar la cuenta');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.avatarNombre}>{usuario?.nombre}</Text>
        <Text style={styles.avatarEmail}>{usuario?.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>👤 Propietario</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Editar información</Text>

        {errors.general && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
          </View>
        )}

        {errors.success && (
          <View style={styles.successBox}>
            <Text style={styles.successBoxText}>{errors.success}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={[styles.input, errors.nombre ? styles.inputError : null]}
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={COLORS.textSecondary}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.buttonText}>Guardar cambios</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Acciones de cuenta */}
      <View style={styles.accountActions}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>🗑️ Eliminar cuenta</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, color: COLORS.white, fontWeight: 'bold' },
  avatarNombre: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  avatarEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  rolBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  rolText: { color: COLORS.white, fontSize: 13 },
  form: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  formTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
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
  },
  successBoxText: { color: COLORS.success, fontSize: 14 },
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
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  accountActions: { marginHorizontal: 16, gap: 10 },
  logoutBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: { color: COLORS.primary, fontSize: 15, fontWeight: '500' },
  deleteBtn: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: { color: COLORS.danger, fontSize: 15, fontWeight: '500' },
});