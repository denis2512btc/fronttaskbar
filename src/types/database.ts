export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      competency_roles: {
        Row: {
          id: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profile_competencies: {
        Row: {
          id: string
          profile_id: string
          role_id: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          profile_id: string
          role_id: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          profile_id?: string
          role_id?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'profile_competencies_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profile_competencies_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'competency_roles'
            referencedColumns: ['id']
          },
        ]
      }
      board_members: {
        Row: {
          board_id: string
          user_id: string
          created_at: string
          competency_role_id: string
        }
        Insert: {
          board_id: string
          user_id: string
          created_at?: string
          competency_role_id: string
        }
        Update: {
          board_id?: string
          user_id?: string
          created_at?: string
          competency_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'board_members_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'board_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'board_members_competency_role_id_fkey'
            columns: ['competency_role_id']
            isOneToOne: false
            referencedRelation: 'competency_roles'
            referencedColumns: ['id']
          },
        ]
      }
      board_columns: {
        Row: {
          id: string
          board_id: string
          title: string
          color: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          title: string
          color: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          title?: string
          color?: string
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'board_columns_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          board_id: string
          column_id: string
          title: string
          description: string
          color: string
          assignee_id: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          column_id: string
          title: string
          description?: string
          color: string
          assignee_id?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          column_id?: string
          title?: string
          description?: string
          color?: string
          assignee_id?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_column_id_fkey'
            columns: ['column_id']
            isOneToOne: false
            referencedRelation: 'board_columns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_assignee_id_fkey'
            columns: ['assignee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
