export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            daos: {
                Row: {
                    created_at: string;
                    dao_id: string;
                    description: string;
                    logo: string;
                    name: string;
                    owner_address: string;
                    socials: string[];
                    tokens: Json[];
                };
                Insert: {
                    created_at?: string;
                    dao_id?: string;
                    description: string;
                    logo: string;
                    name: string;
                    owner_address: string;
                    socials: string[];
                    tokens: Json[];
                };
                Update: {
                    created_at?: string;
                    dao_id?: string;
                    description?: string;
                    logo?: string;
                    name?: string;
                    owner_address?: string;
                    socials?: string[];
                    tokens?: Json[];
                };
                Relationships: [
                    {
                        foreignKeyName: "daos_owner_address_fkey";
                        columns: ["owner_address"];
                        isOneToOne: false;
                        referencedRelation: "members";
                        referencedColumns: ["member_id"];
                    },
                ];
            };
            members: {
                Row: {
                    created_at: string;
                    member_id: string;
                    reputation: number;
                };
                Insert: {
                    created_at?: string;
                    member_id: string;
                    reputation: number;
                };
                Update: {
                    created_at?: string;
                    member_id?: string;
                    reputation?: number;
                };
                Relationships: [];
            };
            memberships: {
                Row: {
                    created_at: string;
                    dao_id: string;
                    house: Database["public"]["Enums"]["HOUSES"];
                    member_id: string;
                };
                Insert: {
                    created_at?: string;
                    dao_id?: string;
                    house: Database["public"]["Enums"]["HOUSES"];
                    member_id: string;
                };
                Update: {
                    created_at?: string;
                    dao_id?: string;
                    house?: Database["public"]["Enums"]["HOUSES"];
                    member_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "memberships_dao_id_fkey";
                        columns: ["dao_id"];
                        isOneToOne: false;
                        referencedRelation: "daos";
                        referencedColumns: ["dao_id"];
                    },
                    {
                        foreignKeyName: "memberships_member_id_fkey";
                        columns: ["member_id"];
                        isOneToOne: false;
                        referencedRelation: "members";
                        referencedColumns: ["member_id"];
                    },
                ];
            };
            proposals: {
                Row: {
                    conclusion:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    created_at: string;
                    dao_id: string | null;
                    description: string;
                    feedback_conclusion:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    feedback_end: string;
                    proposal_id: string;
                    title: string;
                    voting_end: string;
                    voting_house: Database["public"]["Enums"]["HOUSES"];
                    voting_start: string;
                };
                Insert: {
                    conclusion?:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    created_at?: string;
                    dao_id?: string | null;
                    description: string;
                    feedback_conclusion?:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    feedback_end: string;
                    proposal_id?: string;
                    title: string;
                    voting_end: string;
                    voting_house: Database["public"]["Enums"]["HOUSES"];
                    voting_start: string;
                };
                Update: {
                    conclusion?:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    created_at?: string;
                    dao_id?: string | null;
                    description?: string;
                    feedback_conclusion?:
                        | Database["public"]["Enums"]["VOTE_TYPES"]
                        | null;
                    feedback_end?: string;
                    proposal_id?: string;
                    title?: string;
                    voting_end?: string;
                    voting_house?: Database["public"]["Enums"]["HOUSES"];
                    voting_start?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "proposals_dao_id_fkey";
                        columns: ["dao_id"];
                        isOneToOne: false;
                        referencedRelation: "daos";
                        referencedColumns: ["dao_id"];
                    },
                ];
            };
            votes: {
                Row: {
                    created_at: string;
                    is_feedback: boolean;
                    member_id: string;
                    proposal_id: string;
                    vote: Database["public"]["Enums"]["VOTE_TYPES"];
                    weight: number;
                };
                Insert: {
                    created_at?: string;
                    is_feedback: boolean;
                    member_id: string;
                    proposal_id?: string;
                    vote: Database["public"]["Enums"]["VOTE_TYPES"];
                    weight: number;
                };
                Update: {
                    created_at?: string;
                    is_feedback?: boolean;
                    member_id?: string;
                    proposal_id?: string;
                    vote?: Database["public"]["Enums"]["VOTE_TYPES"];
                    weight?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "votes_member_id_fkey";
                        columns: ["member_id"];
                        isOneToOne: false;
                        referencedRelation: "members";
                        referencedColumns: ["member_id"];
                    },
                    {
                        foreignKeyName: "votes_proposal_id_fkey";
                        columns: ["proposal_id"];
                        isOneToOne: false;
                        referencedRelation: "proposals";
                        referencedColumns: ["proposal_id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            HOUSES: "1" | "2" | "3" | "4";
            VOTE_TYPES: "YES" | "NO" | "ABSTAIN";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            HOUSES: ["1", "2", "3", "4"],
            VOTE_TYPES: ["YES", "NO", "ABSTAIN"],
        },
    },
} as const;
