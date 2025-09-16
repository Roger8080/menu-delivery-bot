export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      associacao_produto_condimento: {
        Row: {
          created_at: string
          id: string
          id_condimento: string
          id_produto: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_condimento: string
          id_produto: string
        }
        Update: {
          created_at?: string
          id?: string
          id_condimento?: string
          id_produto?: string
        }
        Relationships: [
          {
            foreignKeyName: "associacao_produto_condimento_id_condimento_fkey"
            columns: ["id_condimento"]
            isOneToOne: false
            referencedRelation: "condimentos"
            referencedColumns: ["id_condimento"]
          },
          {
            foreignKeyName: "associacao_produto_condimento_id_produto_fkey"
            columns: ["id_produto"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id_produto"]
          },
        ]
      }
      condimentos: {
        Row: {
          created_at: string
          id: string
          id_condimento: string
          link_imagem: string | null
          nome_condimento: string
          selecao_multipla: string
          tipo_condimento: string
          updated_at: string
          valor_adicional: number
        }
        Insert: {
          created_at?: string
          id?: string
          id_condimento: string
          link_imagem?: string | null
          nome_condimento: string
          selecao_multipla?: string
          tipo_condimento: string
          updated_at?: string
          valor_adicional?: number
        }
        Update: {
          created_at?: string
          id?: string
          id_condimento?: string
          link_imagem?: string | null
          nome_condimento?: string
          selecao_multipla?: string
          tipo_condimento?: string
          updated_at?: string
          valor_adicional?: number
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          aprovado: string
          bairro: string
          carrinho: string
          cep: string
          cidade: string
          complemento: string | null
          created_at: string
          data_pedido: string
          id: string
          id_pedido: string
          logradouro: string
          nome_usuario: string
          numero: string
          telefone: string
          tipo_pagamento: string
          updated_at: string
        }
        Insert: {
          aprovado?: string
          bairro: string
          carrinho: string
          cep: string
          cidade: string
          complemento?: string | null
          created_at?: string
          data_pedido?: string
          id?: string
          id_pedido: string
          logradouro: string
          nome_usuario: string
          numero: string
          telefone: string
          tipo_pagamento: string
          updated_at?: string
        }
        Update: {
          aprovado?: string
          bairro?: string
          carrinho?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          created_at?: string
          data_pedido?: string
          id?: string
          id_pedido?: string
          logradouro?: string
          nome_usuario?: string
          numero?: string
          telefone?: string
          tipo_pagamento?: string
          updated_at?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          id_produto: string
          link_imagem: string | null
          titulo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          id_produto: string
          link_imagem?: string | null
          titulo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          id_produto?: string
          link_imagem?: string | null
          titulo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      produtos_vendidos: {
        Row: {
          aprovado: string
          bairro: string
          carrinho: string
          categoria: string
          cep: string
          cidade: string
          condimentos_selecionados: string | null
          created_at: string
          data_pedido: string
          descricao: string | null
          id: string
          id_condimento: string | null
          id_pedido: string
          id_produto: string
          id_produtos_vendidos: string
          logradouro: string
          nome_usuario: string
          numero: string
          telefone: string
          tipo_pagamento: string
          titulo: string
          updated_at: string
          valor: number
          valor_condimentos: number
        }
        Insert: {
          aprovado?: string
          bairro: string
          carrinho: string
          categoria: string
          cep: string
          cidade: string
          condimentos_selecionados?: string | null
          created_at?: string
          data_pedido: string
          descricao?: string | null
          id?: string
          id_condimento?: string | null
          id_pedido: string
          id_produto: string
          id_produtos_vendidos: string
          logradouro: string
          nome_usuario: string
          numero: string
          telefone: string
          tipo_pagamento: string
          titulo: string
          updated_at?: string
          valor: number
          valor_condimentos?: number
        }
        Update: {
          aprovado?: string
          bairro?: string
          carrinho?: string
          categoria?: string
          cep?: string
          cidade?: string
          condimentos_selecionados?: string | null
          created_at?: string
          data_pedido?: string
          descricao?: string | null
          id?: string
          id_condimento?: string | null
          id_pedido?: string
          id_produto?: string
          id_produtos_vendidos?: string
          logradouro?: string
          nome_usuario?: string
          numero?: string
          telefone?: string
          tipo_pagamento?: string
          titulo?: string
          updated_at?: string
          valor?: number
          valor_condimentos?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_vendidos_carrinho_fkey"
            columns: ["carrinho"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["carrinho"]
          },
          {
            foreignKeyName: "produtos_vendidos_id_pedido_fkey"
            columns: ["id_pedido"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id_pedido"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
