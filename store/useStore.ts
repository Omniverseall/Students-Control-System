// store/useStore.ts
import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Group, Parent, Student } from '@/types'; // Убрали Template

function cleanUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

function cleanKey(key: string): string {
  if (!key) return '';
  return key.trim();
}

interface AppState {
  supabaseUrl: string;
  supabaseKey: string;
  macrodroidUrl: string;
  isConfigured: boolean;
  supabaseClient: SupabaseClient | null;
  
  groups: Group[];
  parents: Parent[];
  students: Student[];
  // Убрали templates: Template[];
  
  isLoading: boolean;
  connectionError: string | null;
  activeTab: 'workspace' | 'admin';
  selectedGroupId: string | null;
  isComplaintModalOpen: boolean;
  complaintStudentId: string | null;
  alertDialog: { isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' };
  
  openAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  closeAlert: () => void;
  loadConfig: () => Promise<void>;
  setActiveTab: (tab: 'workspace' | 'admin') => void;
  setSelectedGroupId: (id: string | null) => void;
  openComplaintModal: (studentId: string) => void;
  closeComplaintModal: () => void;
  fetchData: () => Promise<void>;
  
  addGroup: (name: string) => Promise<void>;
  updateGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addParent: (name: string, phone: string, role?: string) => Promise<void>;
  updateParent: (id: string, name: string, phone: string, role?: string) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  addStudent: (name: string, groupId: string, parentId: string, firstArrivalDate?: string, firstPaymentDate?: string) => Promise<void>;
  updateStudent: (id: string, name: string, groupId: string, parentId: string, firstArrivalDate?: string, firstPaymentDate?: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  supabaseUrl: '',
  supabaseKey: '',
  macrodroidUrl: '',
  isConfigured: false,
  supabaseClient: null,

  groups: [],
  parents: [],
  students: [],
  isLoading: false,
  connectionError: null,

  activeTab: 'workspace',
  selectedGroupId: null,
  isComplaintModalOpen: false,
  complaintStudentId: null,

  alertDialog: { isOpen: false, title: '', message: '', type: 'info' },

  openAlert: (title, message, type = 'info') => set({ alertDialog: { isOpen: true, title, message, type } }),
  closeAlert: () => set(state => ({ alertDialog: { ...state.alertDialog, isOpen: false } })),

  loadConfig: async () => {
    if (typeof window !== 'undefined') {
      let url = '';
      let key = '';
      let macroUrl = '';

      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const config = await res.json();
          url = config.supabaseUrl || '';
          key = config.supabaseKey || '';
          macroUrl = config.macrodroidUrl || '';
        }
      } catch (err) {
        console.error('Could not fetch server configuration:', err);
      }

      const sanitizedUrl = cleanUrl(url);
      const sanitizedKey = cleanKey(key);
      const sanitizedMacro = macroUrl.trim();
      
      const isConfigured = Boolean(sanitizedUrl && sanitizedKey);
      let client = null;
      if (isConfigured) {
        client = createClient(sanitizedUrl, sanitizedKey);
      }

      set({ 
        supabaseUrl: sanitizedUrl, 
        supabaseKey: sanitizedKey, 
        macrodroidUrl: sanitizedMacro,
        isConfigured,
        supabaseClient: client,
        connectionError: null
      });

      if (isConfigured) {
        await get().fetchData();
      }
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  openComplaintModal: (studentId) => set({ isComplaintModalOpen: true, complaintStudentId: studentId }),
  closeComplaintModal: () => set({ isComplaintModalOpen: false, complaintStudentId: null }),

  fetchData: async () => {
    const { supabaseClient, isConfigured } = get();
    if (!isConfigured || !supabaseClient) return;

    set({ isLoading: true, connectionError: null });
    try {
      // Больше не загружаем templates, только основные данные
      const [groupsRes, parentsRes, studentsRes] = await Promise.all([
        supabaseClient.from('groups').select('*').order('name'),
        supabaseClient.from('parents').select('*').order('full_name'),
        supabaseClient.from('students').select('*, groups(*), parents(*)').order('full_name')
      ]);

      if (groupsRes.error) throw groupsRes.error;
      if (parentsRes.error) throw parentsRes.error;
      if (studentsRes.error) throw studentsRes.error;

      set({
        groups: groupsRes.data || [],
        parents: parentsRes.data || [],
        students: studentsRes.data || [],
        isLoading: false,
        connectionError: null
      });
    } catch (error: any) {
      console.error("Error fetching data:", error);
      const msg = error?.message || String(error);
      set({ 
        isLoading: false, 
        connectionError: `Ошибка подключения к бд Supabase: ${msg}` 
      });
    }
  },

  addGroup: async (name) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('groups').insert([{ name }]);
    get().fetchData();
  },
  updateGroup: async (id, name) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('groups').update({ name }).eq('id', id);
    get().fetchData();
  },
  deleteGroup: async (id) => {
    const { supabaseClient, selectedGroupId } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('groups').delete().eq('id', id);
    if (selectedGroupId === id) set({ selectedGroupId: null });
    get().fetchData();
  },
  addParent: async (name, phone, role) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').insert([{ full_name: name, phone_number: phone, role }]);
    get().fetchData();
  },
  updateParent: async (id, name, phone, role) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').update({ full_name: name, phone_number: phone, role }).eq('id', id);
    get().fetchData();
  },
  deleteParent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').delete().eq('id', id);
    get().fetchData();
  },
  addStudent: async (name, groupId, parentId, firstArrivalDate, firstPaymentDate) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').insert([{
      full_name: name, group_id: groupId, parent_id: parentId,
      first_arrival_date: firstArrivalDate || null, first_payment_date: firstPaymentDate || null
    }]);
    get().fetchData();
  },
  updateStudent: async (id, name, groupId, parentId, firstArrivalDate, firstPaymentDate) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').update({
      full_name: name, group_id: groupId, parent_id: parentId,
      first_arrival_date: firstArrivalDate || null, first_payment_date: firstPaymentDate || null
    }).eq('id', id);
    get().fetchData();
  },
  deleteStudent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').delete().eq('id', id);
    get().fetchData();
  }
}));