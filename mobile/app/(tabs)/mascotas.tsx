import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, API_URL } from '../../config';
import { Mascota } from '../../types';

export default function MascotasScreen() {
  const router = useRouter();
  const { token, refreshMascotas } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMascotas = async () => {
    try {
      const response = await fetch(`${API_URL}/mascotas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMascotas(data);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMascotas();
    await refreshMascotas();
    setRefreshing(false);
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro que deseas eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/mascotas/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                await fetchMascotas();
                await refreshMascotas();
              } else {
                Alert.alert('Error', 'No se pudo eliminar la mascota');
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
    fetchMascotas();
  }, []);

  const getMascotaIcon = (especie: string) => {
    switch (especie) {
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando mascotas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/mascotas/register')}
          >
            <Text style={styles.addButtonText}>+ Registrar nueva mascota</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>Sin mascotas registradas</Text>
            <Text style={styles.emptyText}>Registra tu primera mascota para solicitar citas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>{getMascotaIcon(item.especie)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNombre}>{item.nombre}</Text>
                <Text style={styles.cardEspecie}>{item.especie} · {item.raza}</Text>
                <Text style={styles.cardEdad}>{item.edad} {item.edad === 1 ? 'año' : 'años'}</Text>
              </View>
            </View>

            {item.historial_medico ? (
              <View style={styles.historialContainer}>
                <Text style={styles.historialLabel}>📋 Historial médico</Text>
                <Text style={styles.historialText}>{item.historial_medico}</Text>
              </View>
            ) : null}

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.citaBtn]}
                onPress={() => router.push(`/citas/register?mascotaId=${item.id}&mascotaNombre=${item.nombre}`)}
              >
                <Text style={styles.actionBtnText}>📅 Pedir cita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => router.push(`/mascotas/edit/${item.id}`)}
              >
                <Text style={styles.actionBtnText}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(item.id, item.nombre)}
              >
                <Text style={styles.actionBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
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
  backgroundColor: COLORS.teal,
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  cardEspecie: { fontSize: 13, color: COLORS.textSecondary },
  cardEdad: { fontSize: 13, color: COLORS.textSecondary },
  historialContainer: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  historialLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 4 },
  historialText: { fontSize: 13, color: COLORS.text },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
citaBtn: { backgroundColor: COLORS.teal },
editBtn: { backgroundColor: COLORS.secondary },
deleteBtn: { backgroundColor: COLORS.danger, flex: 0, paddingHorizontal: 16 },
  actionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
});