import { Tabs } from 'expo-router';
import { COLORS } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity, Text, View, Image } from 'react-native';

export default function TabLayout() {
  const { logout, usuario } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.teal,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.grayBorder,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        header: () => (
          <View style={{
            backgroundColor: COLORS.white,
            paddingTop: 50,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 3,
            borderBottomColor: COLORS.teal,
          }}>
            {/* Logo a la izquierda */}
            <Image
              source={{ uri: 'https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png' }}
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />

            {/* Saludo al centro */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                color: COLORS.textSecondary,
                fontSize: 12,
              }}>
                Bienvenido
              </Text>
              <Text style={{
                color: COLORS.primary,
                fontSize: 15,
                fontWeight: 'bold',
              }}>
                {usuario?.nombre?.split(' ')[0]} 👋
              </Text>
            </View>

            {/* Botón salir a la derecha */}
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: COLORS.secondary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: '500' }}>
                Salir
              </Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mascotas"
        options={{
          title: 'Mascotas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🐾</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}