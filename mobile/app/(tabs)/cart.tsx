import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/useCartStore';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Carrito</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="shopping-cart" size={48} color="#d4d4d8" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySub}>Explora el catálogo y añade pulpas naturales.</Text>
          <Link href="/(tabs)/catalogo" asChild>
            <Pressable style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Ir al catálogo</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
            showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.thumb}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      alt={item.name}
                      style={styles.thumbImg}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <FontAwesome name="image" size={24} color="#a1a1aa" />
                  )}
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.unit}>
                    RD${item.price} · {item.unit}
                  </Text>
                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() =>
                        item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)
                      }>
                      <FontAwesome name="minus" size={12} color="#18181b" />
                    </Pressable>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}>
                      <FontAwesome name="plus" size={12} color="#18181b" />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.rowEnd}>
                  <Text style={styles.lineTotal}>RD${(item.price * item.quantity).toFixed(2)}</Text>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <FontAwesome name="trash" size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Subtotal</Text>
              <Text style={styles.footerValue}>RD${total.toFixed(2)}</Text>
            </View>
            <Link href="/checkout" asChild>
              <Pressable style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.92 }]}>
                <Text style={styles.checkoutBtnText}>Ir al checkout</Text>
              </Pressable>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    color: '#18181b',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
  },
  emptySub: {
    fontSize: 15,
    color: '#71717a',
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: '#059669',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#18181b' },
  unit: { fontSize: 12, color: '#71717a' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  rowEnd: { alignItems: 'flex-end', gap: 8 },
  lineTotal: { fontSize: 15, fontWeight: '800', color: '#059669' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fafafa',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: { fontSize: 15, color: '#52525b', fontWeight: '600' },
  footerValue: { fontSize: 18, fontWeight: '900', color: '#18181b' },
  checkoutBtn: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
});
