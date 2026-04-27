import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config';
import { Cita } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { token, mascotas } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCitas = async () => {
    try {
      const response = await fetch(`${API_URL}/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCitas();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const citasPendientes = citas.filter(c => c.estado === 'pendiente');
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada');
  const proximaCita = citasConfirmadas[0] || citasPendientes[0];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return COLORS.success;
      case 'pendiente': return COLORS.warning;
      case 'cancelada': return COLORS.danger;
      case 'completada': return COLORS.gray;
      default: return COLORS.gray;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '✅ Confirmada';
      case 'pendiente': return '⏳ Pendiente';
      case 'cancelada': return '❌ Cancelada';
      case 'completada': return '✔️ Completada';
      default: return estado;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} />
      }
    >
      {/* Próxima cita */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Próxima cita</Text>
        {proximaCita ? (
          <View style={styles.citaCard}>
            <View style={styles.citaHeader}>
              <Text style={styles.citaMascota}>🐾 {proximaCita.mascota_nombre}</Text>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(proximaCita.estado) + '20' }]}>
                <Text style={[styles.estadoText, { color: getEstadoColor(proximaCita.estado) }]}>
                  {getEstadoLabel(proximaCita.estado)}
                </Text>
              </View>
            </View>
            <Text style={styles.citaServicio}>💉 {proximaCita.servicio}</Text>
            <Text style={styles.citaFecha}>📅 {proximaCita.fecha} · ⏰ {proximaCita.hora}</Text>
            <Text style={styles.citaMotivo}>📝 {proximaCita.motivo}</Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No tienes citas próximas</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/citas')}
            >
              <Text style={styles.emptyButtonText}>Solicitar cita</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mis mascotas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🐾 Mis mascotas</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/mascotas')}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {mascotas.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mascotas.map((mascota) => (
              <View key={mascota.id} style={styles.mascotaCard}>
                <Text style={styles.mascotaIcon}>
                  {mascota.especie === 'Gato' ? '🐱' :
                   mascota.especie === 'Ave' ? '🐦' :
                   mascota.especie === 'Conejo' ? '🐰' : '🐶'}
                </Text>
                <Text style={styles.mascotaNombre}>{mascota.nombre}</Text>
                <Text style={styles.mascotaEspecie}>{mascota.especie}</Text>
                <Text style={styles.mascotaRaza}>{mascota.raza}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/mascota-inicial')}
            >
              <Text style={styles.emptyButtonText}>Registrar mascota</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Accesos rápidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/citas')}
          >
            <Text style={styles.quickIcon}>📅</Text>
            <Text style={styles.quickText}>Solicitar cita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/mascotas')}
          >
            <Text style={styles.quickIcon}>🐾</Text>
            <Text style={styles.quickText}>Mis mascotas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/perfil')}
          >
            <Text style={styles.quickIcon}>👤</Text>
            <Text style={styles.quickText}>Mi perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={onRefresh}
          >
            <Text style={styles.quickIcon}>🔄</Text>
            <Text style={styles.quickText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info veterinaria */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🏥 Veterinaria Memo</Text>
        <Text style={styles.infoText}>📞 8703-4402</Text>
        <Text style={styles.infoText}>🕐 Lunes a Sábado: 7:00am – 6:00pm</Text>
        <Text style={styles.infoText}>📍 Costa Rica</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  section: { padding: 16, marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionLink: { fontSize: 13, color: COLORS.teal, fontWeight: '500' },
  citaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  citaMascota: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoText: { fontSize: 12, fontWeight: '500' },
  citaServicio: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  citaFecha: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  citaMotivo: { fontSize: 13, color: COLORS.textSecondary },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  emptyButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
  mascotaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    elevation: 2,
    borderTopWidth: 3,
    borderTopColor: COLORS.secondary,
  },
  mascotaIcon: { fontSize: 36, marginBottom: 8 },
  mascotaNombre: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  mascotaEspecie: { fontSize: 12, color: COLORS.textSecondary },
  mascotaRaza: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    elevation: 2,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.teal,
  },
  quickIcon: { fontSize: 28, marginBottom: 6 },
  quickText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  infoCard: {
  backgroundColor: COLORS.teal,
  margin: 16,
  borderRadius: 12,
  padding: 16,
  marginBottom: 30,
  alignItems: 'center',
},
infoTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: COLORS.white,
  marginBottom: 10,
},
infoText: {
  fontSize: 13,
  color: 'rgba(255,255,255,0.9)',
  marginBottom: 4,
},
});