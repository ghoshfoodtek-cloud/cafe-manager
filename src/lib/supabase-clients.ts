import { supabase } from '@/integrations/supabase/client';
import type { ExtClient } from '@/types/client';

export const getClients = async (): Promise<ExtClient[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(client => ({
    id: client.id,
    fullName: client.full_name,
    firstName: client.first_name || undefined,
    middleName: client.middle_name || undefined,
    lastName: client.last_name || undefined,
    age: client.age || undefined,
    phones: client.phones || [],
    address: client.address || undefined,
    city: client.city || undefined,
    village: client.village || undefined,
    block: client.block || undefined,
    profession: client.profession || undefined,
    qualifications: client.qualifications || undefined,
    email: client.email || undefined,
    company: client.company || undefined,
    profilePhoto: client.profile_photo || undefined,
    groupId: client.group_id || undefined,
    createdAt: client.created_at,
  }));
};

export const getClient = async (id: string): Promise<ExtClient | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    firstName: data.first_name || undefined,
    middleName: data.middle_name || undefined,
    lastName: data.last_name || undefined,
    age: data.age || undefined,
    phones: data.phones || [],
    address: data.address || undefined,
    city: data.city || undefined,
    village: data.village || undefined,
    block: data.block || undefined,
    profession: data.profession || undefined,
    qualifications: data.qualifications || undefined,
    email: data.email || undefined,
    company: data.company || undefined,
    profilePhoto: data.profile_photo || undefined,
    groupId: data.group_id || undefined,
    createdAt: data.created_at,
  };
};

export const createClient = async (client: Omit<ExtClient, 'id' | 'createdAt'>, userId: string): Promise<ExtClient> => {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: client.fullName,
      first_name: client.firstName,
      middle_name: client.middleName,
      last_name: client.lastName,
      age: client.age,
      phones: client.phones,
      address: client.address,
      city: client.city,
      village: client.village,
      block: client.block,
      profession: client.profession,
      qualifications: client.qualifications,
      email: client.email,
      company: client.company,
      profile_photo: client.profilePhoto,
      group_id: client.groupId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    fullName: data.full_name,
    firstName: data.first_name || undefined,
    middleName: data.middle_name || undefined,
    lastName: data.last_name || undefined,
    age: data.age || undefined,
    phones: data.phones || [],
    address: data.address || undefined,
    city: data.city || undefined,
    village: data.village || undefined,
    block: data.block || undefined,
    profession: data.profession || undefined,
    qualifications: data.qualifications || undefined,
    email: data.email || undefined,
    company: data.company || undefined,
    profilePhoto: data.profile_photo || undefined,
    groupId: data.group_id || undefined,
    createdAt: data.created_at,
  };
};

export const updateClient = async (id: string, client: Partial<ExtClient>): Promise<void> => {
  const updateData: any = {};
  
  if (client.fullName !== undefined) updateData.full_name = client.fullName;
  if (client.firstName !== undefined) updateData.first_name = client.firstName;
  if (client.middleName !== undefined) updateData.middle_name = client.middleName;
  if (client.lastName !== undefined) updateData.last_name = client.lastName;
  if (client.age !== undefined) updateData.age = client.age;
  if (client.phones !== undefined) updateData.phones = client.phones;
  if (client.address !== undefined) updateData.address = client.address;
  if (client.city !== undefined) updateData.city = client.city;
  if (client.village !== undefined) updateData.village = client.village;
  if (client.block !== undefined) updateData.block = client.block;
  if (client.profession !== undefined) updateData.profession = client.profession;
  if (client.qualifications !== undefined) updateData.qualifications = client.qualifications;
  if (client.email !== undefined) updateData.email = client.email;
  if (client.company !== undefined) updateData.company = client.company;
  if (client.profilePhoto !== undefined) updateData.profile_photo = client.profilePhoto;
  if (client.groupId !== undefined) updateData.group_id = client.groupId;

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
