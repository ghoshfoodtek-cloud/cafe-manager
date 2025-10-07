import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderEvent } from '@/pages/Orders';

export const getOrders = async (): Promise<Order[]> => {
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  const orders = await Promise.all((ordersData || []).map(async (order) => {
    const { data: events, error: eventsError } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    return {
      id: order.id,
      title: order.title,
      clientId: order.client_id || undefined,
      status: order.status as 'pending' | 'in_progress' | 'completed',
      createdAt: order.created_at,
      deletedAt: order.deleted_at || undefined,
      events: (events || []).map(e => ({
        id: e.id,
        timestamp: e.created_at,
        title: e.title,
        note: e.note || undefined,
        attachments: e.attachments || undefined,
      })),
    };
  }));

  return orders;
};

export const getOrder = async (id: string): Promise<Order | null> => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null;
    throw orderError;
  }

  const { data: events, error: eventsError } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  if (eventsError) throw eventsError;

  return {
    id: orderData.id,
    title: orderData.title,
    clientId: orderData.client_id || undefined,
    status: orderData.status as 'pending' | 'in_progress' | 'completed',
    createdAt: orderData.created_at,
    deletedAt: orderData.deleted_at || undefined,
    events: (events || []).map(e => ({
      id: e.id,
      timestamp: e.created_at,
      title: e.title,
      note: e.note || undefined,
      attachments: e.attachments || undefined,
    })),
  };
};

export const createOrder = async (order: { title: string; status: string; clientId?: string }, userId: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      title: order.title,
      status: order.status,
      client_id: order.clientId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    clientId: data.client_id || undefined,
    status: data.status as 'pending' | 'in_progress' | 'completed',
    createdAt: data.created_at,
    deletedAt: data.deleted_at || undefined,
    events: [],
  };
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  const updateData: any = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
  if (updates.deletedAt !== undefined) updateData.deleted_at = updates.deletedAt;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const addOrderEvent = async (orderId: string, event: { title: string; note?: string; attachments?: string[] }, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('order_events')
    .insert({
      order_id: orderId,
      title: event.title,
      note: event.note,
      attachments: event.attachments,
      created_by: userId,
    });

  if (error) throw error;
};

export const deleteOrderEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from('order_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};
