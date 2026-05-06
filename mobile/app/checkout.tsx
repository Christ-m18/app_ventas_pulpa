import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CheckoutFormData } from '@/constants/checkout';
import { checkoutSchema, ZONES } from '@/constants/checkout';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);
  const [busy, setBusy] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cash_on_delivery',
      zone: 'distrito-nacional',
      notes: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const zoneId = watch('zone');
  const paymentMethod = watch('paymentMethod');
  const selectedZone = useMemo(() => ZONES.find((z) => z.id === zoneId), [zoneId]);
  const shippingCost = selectedZone?.cost ?? 0;
  const grandTotal = total + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Añade productos antes de confirmar.');
      return;
    }

    const notesBlock = [
      data.notes?.trim(),
      `Cliente: ${data.fullName}`,
      `Email: ${data.email}`,
    ]
      .filter(Boolean)
      .join('\n');

    setBusy(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total: grandTotal,
          payment_method: data.paymentMethod,
          delivery_address: data.address,
          zone: data.zone,
          shipping_cost: shippingCost,
          phone: data.phone,
          notes: notesBlock || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      router.replace(`/order-confirmation/${order.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      Alert.alert('No se pudo completar el pedido', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.inner, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.sub}>Completa tus datos para la entrega.</Text>

        <Text style={styles.section}>Cliente</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
              {errors.fullName ? (
                <Text style={styles.err}>{errors.fullName.message}</Text>
              ) : null}
            </>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="juan@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
              {errors.email ? <Text style={styles.err}>{errors.email.message}</Text> : null}
            </>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={styles.label}>Teléfono (WhatsApp)</Text>
              <TextInput
                style={styles.input}
                placeholder="809-000-0000"
                keyboardType="phone-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
              {errors.phone ? <Text style={styles.err}>{errors.phone.message}</Text> : null}
            </>
          )}
        />

        <Text style={styles.section}>Entrega</Text>
        <Text style={styles.label}>Zona</Text>
        <Controller
          control={control}
          name="zone"
          render={({ field: { onChange, value } }) => (
            <View style={styles.zones}>
              {ZONES.map((z) => (
                <Pressable
                  key={z.id}
                  style={[styles.zoneChip, value === z.id && styles.zoneChipOn]}
                  onPress={() => onChange(z.id)}>
                  <Text style={[styles.zoneText, value === z.id && styles.zoneTextOn]}>
                    {z.name}{' '}
                    <Text style={styles.zoneCost}>+RD${z.cost}</Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={styles.label}>Dirección detallada</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Calle, número, sector, referencias"
                multiline
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
              {errors.address ? <Text style={styles.err}>{errors.address.message}</Text> : null}
            </>
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={styles.label}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej: Tocar el timbre fuerte"
                multiline
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            </>
          )}
        />

        <Text style={styles.section}>Pago</Text>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field: { onChange } }) => (
            <View style={styles.payRow}>
              <Pressable
                style={[styles.payCard, paymentMethod === 'cash_on_delivery' && styles.payCardOn]}
                onPress={() => onChange('cash_on_delivery')}>
                <Text style={styles.payTitle}>Contra entrega</Text>
                <Text style={styles.paySub}>Efectivo al recibir</Text>
              </Pressable>
              <Pressable
                style={[styles.payCard, paymentMethod === 'bank_transfer' && styles.payCardOn]}
                onPress={() => onChange('bank_transfer')}>
                <Text style={styles.payTitle}>Transferencia</Text>
                <Text style={styles.paySub}>Banreservas / Popular</Text>
              </Pressable>
            </View>
          )}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.sumRow}>
              <Text style={styles.sumName}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.sumVal}>RD${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.sumRow}>
            <Text style={styles.sumName}>Subtotal</Text>
            <Text style={styles.sumVal}>RD${total.toFixed(2)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumName}>Envío ({selectedZone?.name})</Text>
            <Text style={styles.sumVal}>RD${shippingCost.toFixed(2)}</Text>
          </View>
          <View style={[styles.sumRow, styles.sumTotalRow]}>
            <Text style={styles.sumTotalLabel}>Total</Text>
            <Text style={styles.sumTotalVal}>RD${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.submit, busy && styles.submitDisabled]}
          disabled={busy}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitText}>{busy ? 'Procesando…' : 'Confirmar pedido'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafafa' },
  inner: { paddingHorizontal: 20, gap: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#18181b' },
  sub: { fontSize: 15, color: '#71717a', marginBottom: 8 },
  section: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '800',
    color: '#18181b',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52525b',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#18181b',
  },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  err: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  zones: { gap: 8 },
  zoneChip: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  zoneChipOn: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  zoneText: { fontSize: 14, fontWeight: '600', color: '#3f3f46' },
  zoneTextOn: { color: '#047857' },
  zoneCost: { fontWeight: '700', color: '#059669' },
  payRow: { flexDirection: 'row', gap: 12 },
  payCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e4e4e7',
    gap: 4,
  },
  payCardOn: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  payTitle: { fontWeight: '800', fontSize: 14, color: '#18181b' },
  paySub: { fontSize: 11, color: '#71717a' },
  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    gap: 8,
  },
  summaryTitle: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumName: { fontSize: 14, color: '#52525b', flex: 1, paddingRight: 8 },
  sumVal: { fontSize: 14, fontWeight: '600', color: '#18181b' },
  sumTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4e4e7',
  },
  sumTotalLabel: { fontSize: 17, fontWeight: '900' },
  sumTotalVal: { fontSize: 17, fontWeight: '900', color: '#059669' },
  submit: {
    marginTop: 20,
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
