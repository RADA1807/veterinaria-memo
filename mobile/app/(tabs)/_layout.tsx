import { Tabs } from 'expo-router';
import { COLORS } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity, Text, View } from 'react-native';

export default function TabLayout() {
  const { logout, usuario } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
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
            backgroundColor: COLORS.primary,
            paddingTop: 50,
            paddingBottom: 14,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                Veterinaria Memo
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>
                Hola, {usuario?.nombre?.split(' ')[0]} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 14,
                paddingVertical: 7,
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