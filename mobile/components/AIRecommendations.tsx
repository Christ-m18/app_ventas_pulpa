import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ProductWithCategory } from '@/lib/types';
import { useCartStore } from '@/store/useCartStore';

const WEB_API = process.env.EXPO_PUBLIC_WEB_API_URL?.replace(/\/$/, '') ?? '';

type RecommendResponse = {
  recommendation: string;
  productIds: string[];
};

type Props = {
  products: ProductWithCategory[];
};

export function AIRecommendations({ products }: Props) {
  const [prompt, setPrompt] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const mutation = useMutation({
    mutationFn: async (text: string): Promise<RecommendResponse> => {
      const res = await fetch(`${WEB_API}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) throw new Error('No se pudo obtener recomendaciones');
      return res.json();
    },
  });

  if (!WEB_API) {
    return (
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>Recomendaciones IA</Text>
        <Text style={styles.hintText}>
          Define EXPO_PUBLIC_WEB_API_URL en mobile/.env apuntando a tu app Next.js (ej.
          http://192.168.x.x:3000) para usar sugerencias con Gemini desde el catálogo web.
        </Text>
      </View>
    );
  }

  const recommended =
    mutation.data?.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as ProductWithCategory[] | undefined;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>¿Qué necesitas hoy?</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: algo para energía por las mañanas"
        placeholderTextColor="#a1a1aa"
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        disabled={mutation.isPending || !prompt.trim()}
        onPress={() => mutation.mutate(prompt.trim())}>
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="magic" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Recomendar</Text>
          </>
        )}
      </Pressable>

      {mutation.isError ? (
        <Text style={styles.error}>Intenta de nuevo o revisa que el servidor Next esté en línea.</Text>
      ) : null}

      {mutation.data ? (
        <View style={styles.result}>
          <Text style={styles.recTitle}>Sugerencia</Text>
          <Text style={styles.recBody}>{mutation.data.recommendation}</Text>
          {recommended && recommended.length > 0 ? (
            <View style={styles.recActions}>
              {recommended.map((p) => (
                <Pressable key={p.id} style={styles.miniAdd} onPress={() => addItem(p)}>
                  <Text style={styles.miniAddText}>Añadir {p.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  hintBox: {
    padding: 14,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e4e4e7',
  },
  hintTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#18181b',
  },
  hintText: {
    fontSize: 13,
    color: '#52525b',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065f46',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#d1fae5',
    minHeight: 72,
    textAlignVertical: 'top',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnPressed: { opacity: 0.9 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  error: { color: '#dc2626', fontSize: 13 },
  result: {
    marginTop: 4,
    gap: 8,
  },
  recTitle: { fontWeight: '800', color: '#047857' },
  recBody: { fontSize: 14, color: '#374151', lineHeight: 20 },
  recActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniAdd: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  miniAddText: { fontSize: 12, fontWeight: '700', color: '#059669' },
});
