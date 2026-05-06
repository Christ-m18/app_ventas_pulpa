import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AIRecommendations } from '@/components/AIRecommendations';
import { ProductCard } from '@/components/ProductCard';
import type { ProductWithCategory } from '@/lib/types';
import { productService } from '@/services/productService';

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const filtered = useMemo(() => {
    const list = productsQuery.data ?? [];
    if (!categoryId) return list;
    return list.filter((p) => p.category_id === categoryId);
  }, [productsQuery.data, categoryId]);

  const listData = useMemo(
    () =>
      filtered.reduce<ProductWithCategory[][]>((rows, item, i) => {
        if (i % 2 === 0) rows.push([item]);
        else rows[rows.length - 1].push(item);
        return rows;
      }, []),
    [filtered]
  );

  const loading = productsQuery.isPending || categoriesQuery.isPending;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuestras Pulpas</Text>
        <Text style={styles.subtitle}>
          Frutas locales seleccionadas para sabor y salud en cada paquete.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(_, i) => `row-${i}`}
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefetching && !productsQuery.isPending}
              onRefresh={() => {
                productsQuery.refetch();
                categoriesQuery.refetch();
              }}
              tintColor="#059669"
            />
          }
          ListHeaderComponent={
            <>
              <AIRecommendations products={productsQuery.data ?? []} />
              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.chips}>
                <Pressable
                  style={[styles.chip, !categoryId && styles.chipActive]}
                  onPress={() => setCategoryId(null)}>
                  <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>Todas</Text>
                </Pressable>
                {(categoriesQuery.data ?? []).map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.chip, categoryId === c.id && styles.chipActive]}
                    onPress={() => setCategoryId(c.id)}>
                    <Text
                      style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.count}>{filtered.length} productos</Text>
            </>
          }
          renderItem={({ item: pair }) => (
            <View style={styles.row}>
              {pair.map((p) => (
                <View key={p.id} style={styles.cell}>
                  <ProductCard product={p} />
                </View>
              ))}
              {pair.length === 1 ? <View style={styles.cell} /> : null}
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#18181b',
  },
  subtitle: {
    fontSize: 15,
    color: '#52525b',
    lineHeight: 22,
  },
  filterLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#3f3f46',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  chipActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
  },
  chipTextActive: {
    color: '#047857',
  },
  count: {
    marginTop: 12,
    fontSize: 13,
    color: '#71717a',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    maxWidth: '48%',
  },
});
