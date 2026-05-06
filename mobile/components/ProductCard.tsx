import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductWithCategory } from '@/lib/types';
import { useCartStore } from '@/store/useCartStore';

type Props = { product: ProductWithCategory; onAdded?: () => void };

function ProductCardInner({ product, onAdded }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product);
    onAdded?.();
  };

  const disabled = product.stock <= 0;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            alt={product.name}
            style={styles.image}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text style={styles.noImage}>Sin imagen</Text>
        )}
        {product.is_featured ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ Top</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.currency}>RD$</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>
          <Pressable
            onPress={handleAdd}
            disabled={disabled}
            style={({ pressed }) => [
              styles.addBtn,
              disabled && styles.addBtnDisabled,
              pressed && !disabled && styles.addBtnPressed,
            ]}>
            <FontAwesome name={disabled ? 'times' : 'plus'} size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardInner);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    maxWidth: '100%',
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: '#f4f4f5',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    fontSize: 11,
    color: '#71717a',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#facc15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#422006',
  },
  body: {
    padding: 12,
    gap: 6,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  desc: {
    fontSize: 11,
    color: '#71717a',
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  currency: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    opacity: 0.85,
  },
  addBtnDisabled: {
    backgroundColor: '#d4d4d8',
  },
});
