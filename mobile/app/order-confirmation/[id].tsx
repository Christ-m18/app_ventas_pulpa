import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconWrap}>
        <FontAwesome name="check" size={40} color="#fff" />
      </View>
      <Text style={styles.title}>¡Pedido recibido!</Text>
      <Text style={styles.sub}>
        Gracias por tu compra. Te contactaremos por WhatsApp para coordinar la entrega.
      </Text>
      <View style={styles.idBox}>
        <Text style={styles.idLabel}>Número de pedido</Text>
        <Text style={styles.idValue} selectable>
          {id}
        </Text>
      </View>
      <Link href="/(tabs)" asChild>
        <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.92 }]}>
          <Text style={styles.btnText}>Volver al inicio</Text>
        </Pressable>
      </Link>
      <Link href="/(tabs)/catalogo" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Seguir comprando</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#18181b',
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: '#52525b',
    textAlign: 'center',
    lineHeight: 22,
  },
  idBox: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  idLabel: { fontSize: 12, fontWeight: '700', color: '#71717a', textTransform: 'uppercase' },
  idValue: { fontSize: 13, fontWeight: '600', color: '#18181b' },
  btn: {
    marginTop: 12,
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  link: { paddingVertical: 12 },
  linkText: { fontSize: 16, fontWeight: '700', color: '#059669' },
});
