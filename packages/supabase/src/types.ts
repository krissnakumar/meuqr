export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          category: string;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          pix_key: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          latitude: number | null;
          longitude: number | null;
          instagram: string | null;
          website: string | null;
          opening_hours: Json | null;
          subscription_tier: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          category: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          pix_key?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          instagram?: string | null;
          website?: string | null;
          opening_hours?: Json | null;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          category?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          pix_key?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          instagram?: string | null;
          website?: string | null;
          opening_hours?: Json | null;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          description: string | null;
          preview_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          description?: string | null;
          preview_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          description?: string | null;
          preview_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      template_sections: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          name: string;
          slug: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["template_id"];
            referencedRelation: "templates";
            referencedColumns: ["id"];
          }
        ];
      };
      template_items: {
        Row: {
          id: string;
          section_id: string;
          name: string;
          description: string | null;
          price: number | null;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          name: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["section_id"];
            referencedRelation: "template_sections";
            referencedColumns: ["id"];
          }
        ];
      };
      pages: {
        Row: {
          id: string;
          business_id: string;
          template_id: string | null;
          title: string;
          slug: string;
          is_published: boolean;
          custom_css: string | null;
          custom_js: string | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          template_id?: string | null;
          title: string;
          slug: string;
          is_published?: boolean;
          custom_css?: string | null;
          custom_js?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          template_id?: string | null;
          title?: string;
          slug?: string;
          is_published?: boolean;
          custom_css?: string | null;
          custom_js?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      sections: {
        Row: {
          id: string;
          page_id: string;
          name: string;
          slug: string;
          section_type: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          name: string;
          slug: string;
          section_type?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          name?: string;
          slug?: string;
          section_type?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      items: {
        Row: {
          id: string;
          section_id: string;
          name: string;
          description: string | null;
          price: number | null;
          original_price: number | null;
          image_url: string | null;
          item_type: string;
          is_available: boolean;
          sort_order: number;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          name: string;
          description?: string | null;
          price?: number | null;
          original_price?: number | null;
          image_url?: string | null;
          item_type?: string;
          is_available?: boolean;
          sort_order?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          original_price?: number | null;
          image_url?: string | null;
          item_type?: string;
          is_available?: boolean;
          sort_order?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["section_id"];
            referencedRelation: "sections";
            referencedColumns: ["id"];
          }
        ];
      };
      qr_codes: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          short_code: string;
          title: string | null;
          destination_url: string | null;
          is_active: boolean;
          scan_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          short_code: string;
          title?: string | null;
          destination_url?: string | null;
          is_active?: boolean;
          scan_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          page_id?: string | null;
          short_code?: string;
          title?: string | null;
          destination_url?: string | null;
          is_active?: boolean;
          scan_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      qr_styles: {
        Row: {
          id: string;
          qr_code_id: string;
          dot_style: string;
          corner_style: string;
          foreground_color: string;
          background_color: string;
          gradient: boolean;
          gradient_color: string | null;
          logo_url: string | null;
          margin: number;
          error_correction_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          qr_code_id: string;
          dot_style?: string;
          corner_style?: string;
          foreground_color?: string;
          background_color?: string;
          gradient?: boolean;
          gradient_color?: string | null;
          logo_url?: string | null;
          margin?: number;
          error_correction_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          qr_code_id?: string;
          dot_style?: string;
          corner_style?: string;
          foreground_color?: string;
          background_color?: string;
          gradient?: boolean;
          gradient_color?: string | null;
          logo_url?: string | null;
          margin?: number;
          error_correction_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["qr_code_id"];
            referencedRelation: "qr_codes";
            referencedColumns: ["id"];
          }
        ];
      };
      scans: {
        Row: {
          id: string;
          qr_code_id: string;
          page_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_type: string | null;
          browser: string | null;
          country: string | null;
          city: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          qr_code_id: string;
          page_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          qr_code_id?: string;
          page_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["qr_code_id"];
            referencedRelation: "qr_codes";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      clicks: {
        Row: {
          id: string;
          scan_id: string | null;
          qr_code_id: string | null;
          page_id: string | null;
          click_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_id?: string | null;
          qr_code_id?: string | null;
          page_id?: string | null;
          click_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string | null;
          qr_code_id?: string | null;
          page_id?: string | null;
          click_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["scan_id"];
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["qr_code_id"];
            referencedRelation: "qr_codes";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          message: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          page_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      quote_requests: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          items: Json;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          items: Json;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          page_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          items?: Json;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          items: Json;
          total: number;
          payment_method: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          items: Json;
          total: number;
          payment_method?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          page_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          items?: Json;
          total?: number;
          payment_method?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          order_id: string | null;
          subscription_id: string | null;
          amount: number;
          currency: string;
          provider: string;
          provider_payment_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          order_id?: string | null;
          subscription_id?: string | null;
          amount: number;
          currency?: string;
          provider: string;
          provider_payment_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          order_id?: string | null;
          subscription_id?: string | null;
          amount?: number;
          currency?: string;
          provider?: string;
          provider_payment_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          business_id: string;
          tier: string;
          provider: string;
          provider_subscription_id: string | null;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          tier: string;
          provider: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          tier?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      storage_files: {
        Row: {
          id: string;
          business_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          public_url: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          public_url: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          public_url?: string;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            type: "foreignKey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            type: "foreignKey";
            columns: ["uploaded_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
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
      [_ in never]: never;
    };
  };
}
