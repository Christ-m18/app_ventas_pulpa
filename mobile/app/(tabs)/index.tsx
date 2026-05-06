import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { productService } from '@/services/productService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: featured = [], isPending } = useQuery({
    queryKey: ['featured'],
    queryFn: () => productService.getFeaturedProducts(),
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Bienvenido a</Text>
          <Text style={styles.headerTitle}>Pulpas RD</Text>
        </View>
        <View style={styles.headerIcon}>
          <FontAwesome name="leaf" size={20} color="#059669" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <FontAwesome name="star" size={14} color="#fbbf24" style={{ marginRight: 6 }} />
            <Text style={styles.heroBadgeText}>100% Natural</Text>
          </View>
          <Text style={styles.heroTitle}>Frescura{'\n'}Inmediata</Text>
          <Text style={styles.heroSub}>
            Del campo dominicano directamente a tu congelador.
          </Text>
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>Favoritos</Text>
            <Text style={styles.sectionSub}>Lo más pedido esta semana</Text>
          </View>
          <Link href="/(tabs)/catalogo" asChild>
            <Pressable>
              <Text style={styles.link}>Ver todo →</Text>
            </Pressable>
          </Link>
        </View>

        {isPending ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginVertical: 32 }} />
        ) : featured.length > 0 ? (
          <View style={styles.grid}>
            {featured.map((p) => (
              <View key={p.id} style={styles.gridItem}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay productos destacados aún.</Text>
          </View>
        )}

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Plan Detox Semanal</Text>
          <Text style={styles.ctaSub}>
            5 jugos diseñados para limpiar tu cuerpo y llenarte de energía.
          </Text>
          <Link href="/(tabs)/catalogo" asChild>
            <Pressable style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.92 }]}>
              <Text style={styles.ctaBtnText}>Ver catálogo</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#fafafacc',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#10b981',
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 34,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    maxWidth: '85%',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
  },
  sectionSub: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
  },
  empty: {
    paddingVertical: 36,
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d4d4d8',
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
  },
  cta: {
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  ctaSub: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  ctaBtn: {
    marginTop: 8,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
