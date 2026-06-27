// types/index.ts
export interface Group {
  id: string;
  name: string;
}

export interface Parent {
  id: string;
  full_name: string;
  phone_number: string;
  role?: string;
}

export interface Student {
  id: string;
  full_name: string;
  group_id: string;
  parent_id: string;
  first_arrival_date?: string;
  first_payment_date?: string;
  groups?: Group;
  parents?: Parent;
}