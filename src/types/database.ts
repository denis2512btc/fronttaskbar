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
      board_members: {
        Row: {
          board_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          board_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          board_id?: string
          user_id?: string
          created_at?: string
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
