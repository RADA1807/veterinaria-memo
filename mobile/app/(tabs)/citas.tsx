import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config';
import { Cita } from '../../types';

export default function CitasScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCitas();
    setRefreshing(false);
  };

  const handleCancelar = (id: string) => {
    Alert.alert(
      'Cancelar cita',
      '¿Estás seguro que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/citas/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                await fetchCitas();
              } else {
                Alert.alert('Error', 'No se pudo cancelar la cita');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchCitas();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={citas}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/citas/register')}
          >
            <Text style={styles.addButtonText}>+ Solicitar nueva cita</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Sin citas registradas</Text>
            <Text style={styles.emptyText}>Solicita una cita para tu mascota</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardMascota}>🐾 {item.mascota_nombre}</Text>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
                <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
                  {getEstadoLabel(item.estado)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardServicio}>💉 {item.servicio}</Text>
              <Text style={styles.cardFecha}>📅 {item.fecha} · ⏰ {item.hora}</Text>
              <Text style={styles.cardMotivo}>📝 {item.motivo}</Text>
            </View>

            {item.estado === 'pendiente' && (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => router.push(`/citas/edit/${item.id}`)}
                >
                  <Text style={styles.actionBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Text style={styles.actionBtnText}>❌ Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayLight },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  list: { padding: 16 },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardMascota: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoText: { fontSize: 12, fontWeight: '500' },
  cardBody: { marginBottom: 12 },
  cardServicio: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  cardFecha: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  cardMotivo: { fontSize: 13, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: { backgroundColor: COLORS.warning },
  cancelBtn: { backgroundColor: COLORS.danger },
  actionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
});