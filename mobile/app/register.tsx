import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    apellido?: string;
    cedula?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
    else if (nombre.length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!apellido) newErrors.apellido = 'El apellido es obligatorio';
    else if (apellido.length < 2) newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    if (!cedula) newErrors.cedula = 'La cédula es obligatoria';
    if (!email) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Correo inválido';
    if (!telefono) newErrors.telefono = 'El teléfono es obligatorio';
    if (!direccion) newErrors.direccion = 'La dirección es obligatoria';
    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(nombre.trim(), apellido.trim(), cedula.trim(), email.trim(), telefono.trim(), password, direccion.trim());
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al registrarse' });
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

        {/* Header — igual que login */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Veterinaria Memo</Text>
        </View>

        {/* Wave — igual que login */}
        <View style={styles.wave} />

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para gestionar las citas de tu mascota</Text>

          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {errors.general}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, errors.nombre ? styles.inputError : null]}
              placeholder="Tu nombre "
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={[styles.input, errors.apellido ? styles.inputError : null]}
              placeholder="Tu apellido"
              value={apellido}
              onChangeText={setApellido}
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={[styles.input, errors.cedula ? styles.inputError : null]}
              placeholder="Tu número de cédula"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.telefono ? styles.inputError : null]}
              placeholder="8888-8888"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textSecondary}
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
          </View>

          <View style={styles.inputGroup}>
  <Text style={styles.label}>Dirección</Text>
  <TextInput
    style={[styles.input, errors.direccion ? styles.inputError : null]}
    placeholder="Tu dirección"
    value={direccion}
    onChangeText={setDireccion}
    placeholderTextColor={COLORS.textSecondary}
  />
  {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}
</View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.buttonText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.link}>
              ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión aquí</Text>
            </Text>
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
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  linkBold: { color: COLORS.white, fontWeight: 'bold' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeIcon: { fontSize: 18 },
});