export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          language: string | null;
          is_superadmin: boolean | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          language?: string | null;
          is_superadmin?: boolean | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          language?: string | null;
          is_superadmin?: boolean | null;
          updated_at?: Timestamp;
        };
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
          default_language: string | null;
          notification_settings: Json;
          form_schema: Json;
          vertical_id: string | null;
          subvertical_id: string | null;
          onboarding_completed: boolean;
          setup_step: number;
          created_at: Timestamp;
          updated_at: Timestamp;
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
          default_language?: string | null;
          notification_settings?: Json;
          form_schema?: Json;
          vertical_id?: string | null;
          subvertical_id?: string | null;
          onboarding_completed?: boolean;
          setup_step?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
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
          default_language?: string | null;
          notification_settings?: Json;
          form_schema?: Json;
          vertical_id?: string | null;
          subvertical_id?: string | null;
          onboarding_completed?: boolean;
          setup_step?: number;
          updated_at?: Timestamp;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at?: Timestamp;
        };
        Update: {
          role?: string;
        };
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
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          description?: string | null;
          preview_url?: string | null;
          is_active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          category?: string;
          description?: string | null;
          preview_url?: string | null;
          is_active?: boolean;
        };
      };
      template_sections: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          template_id: string;
          name: string;
          slug: string;
          sort_order?: number;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          sort_order?: number;
        };
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
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          section_id: string;
          name: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          sort_order?: number;
        };
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
          created_at: Timestamp;
          updated_at: Timestamp;
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
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          template_id?: string | null;
          title?: string;
          slug?: string;
          is_published?: boolean;
          custom_css?: string | null;
          custom_js?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_image_url?: string | null;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          page_id: string;
          name: string;
          slug: string;
          section_type?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          section_type?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
          updated_at: Timestamp;
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
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number | null;
          original_price?: number | null;
          image_url?: string | null;
          item_type?: string;
          is_available?: boolean;
          sort_order?: number;
          metadata?: Json | null;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
          updated_at: Timestamp;
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
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          page_id?: string | null;
          short_code?: string;
          title?: string | null;
          destination_url?: string | null;
          is_active?: boolean;
          scan_count?: number;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
          updated_at: Timestamp;
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
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          dot_style?: string;
          corner_style?: string;
          foreground_color?: string;
          background_color?: string;
          gradient?: boolean;
          gradient_color?: string | null;
          logo_url?: string | null;
          margin?: number;
          error_correction_level?: string;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
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
          created_at?: Timestamp;
        };
        Update: {
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          referrer?: string | null;
        };
      };
      clicks: {
        Row: {
          id: string;
          scan_id: string | null;
          qr_code_id: string | null;
          page_id: string | null;
          click_type: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          scan_id?: string | null;
          qr_code_id?: string | null;
          page_id?: string | null;
          click_type: string;
          created_at?: Timestamp;
        };
        Update: {
          click_type?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          client_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          message: string | null;
          source: string | null;
          custom_fields: Json;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          client_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          source?: string | null;
          custom_fields?: Json;
          created_at?: Timestamp;
        };
        Update: {
          client_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          source?: string | null;
          custom_fields?: Json;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          client_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          items: Json;
          message: string | null;
          custom_fields: Json;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          client_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          items: Json;
          message?: string | null;
          custom_fields?: Json;
          created_at?: Timestamp;
        };
        Update: {
          client_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          items?: Json;
          message?: string | null;
          custom_fields?: Json;
        };
      };
      orders: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          client_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          items: Json;
          total: number;
          payment_method: string | null;
          status: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          client_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          items: Json;
          total: number;
          payment_method?: string | null;
          status?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          client_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          items?: Json;
          total?: number;
          payment_method?: string | null;
          status?: string;
          updated_at?: Timestamp;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          business_id: string;
          tier: string;
          provider: string;
          provider_subscription_id: string | null;
          status: string;
          current_period_start: Timestamp;
          current_period_end: Timestamp;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          tier: string;
          provider: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_start?: Timestamp;
          current_period_end?: Timestamp;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          tier?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_start?: Timestamp;
          current_period_end?: Timestamp;
          updated_at?: Timestamp;
        };
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
          created_at: Timestamp;
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
          created_at?: Timestamp;
        };
        Update: {
          order_id?: string | null;
          subscription_id?: string | null;
          amount?: number;
          currency?: string;
          provider?: string;
          provider_payment_id?: string | null;
          status?: string;
        };
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
          created_at: Timestamp;
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
          created_at?: Timestamp;
        };
        Update: {
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          public_url?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string;
          email: string | null;
          source: string;
          last_seen_at: Timestamp;
          last_interaction_type: string | null;
          total_orders: number;
          total_quote_requests: number;
          notes: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone: string;
          email?: string | null;
          source: string;
          last_seen_at?: Timestamp;
          last_interaction_type?: string | null;
          total_orders?: number;
          total_quote_requests?: number;
          notes?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string | null;
          source?: string;
          last_seen_at?: Timestamp;
          last_interaction_type?: string | null;
          total_orders?: number;
          total_quote_requests?: number;
          notes?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          client_id: string | null;
          order_id: string | null;
          quote_request_id: string | null;
          lead_id: string | null;
          qr_code_id: string | null;
          item_id: string | null;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          channel: string;
          status: string;
          priority: string;
          read_at: Timestamp | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          client_id?: string | null;
          order_id?: string | null;
          quote_request_id?: string | null;
          lead_id?: string | null;
          qr_code_id?: string | null;
          item_id?: string | null;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          channel?: string;
          status?: string;
          priority?: string;
          read_at?: Timestamp | null;
          created_at?: Timestamp;
        };
        Update: {
          status?: string;
          read_at?: Timestamp | null;
          priority?: string;
          data?: Json | null;
        };
      };
      device_push_tokens: {
        Row: {
          id: string;
          user_id: string;
          business_id: string | null;
          platform: string;
          expo_push_token: string;
          device_name: string | null;
          is_active: boolean;
          last_used_at: Timestamp | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id?: string | null;
          platform: string;
          expo_push_token: string;
          device_name?: string | null;
          is_active?: boolean;
          last_used_at?: Timestamp | null;
          created_at?: Timestamp;
        };
        Update: {
          is_active?: boolean;
          last_used_at?: Timestamp | null;
          device_name?: string | null;
          business_id?: string | null;
        };
      };
      appointment_services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number | null;
          is_active: boolean | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number | null;
          is_active?: boolean | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number | null;
          is_active?: boolean | null;
          updated_at?: Timestamp;
        };
      };
      staff_members: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          is_active: boolean | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          updated_at?: Timestamp;
        };
      };
      business_availability: {
        Row: {
          id: string;
          business_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          staff_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          staff_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          staff_id?: string | null;
          updated_at?: Timestamp;
        };
      };
      appointment_blackouts: {
        Row: {
          id: string;
          business_id: string;
          start_datetime: Timestamp;
          end_datetime: Timestamp;
          reason: string | null;
          staff_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          start_datetime: Timestamp;
          end_datetime: Timestamp;
          reason?: string | null;
          staff_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          start_datetime?: Timestamp;
          end_datetime?: Timestamp;
          reason?: string | null;
          staff_id?: string | null;
          updated_at?: Timestamp;
        };
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          service_id: string;
          staff_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: string;
          notes: string | null;
          custom_fields: Json;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          service_id: string;
          staff_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string | null;
          custom_fields?: Json;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          service_id?: string;
          staff_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string | null;
          custom_fields?: Json;
          updated_at?: Timestamp;
        };
      };
      system_settings: {
        Row: {
          id: string;
          maintenance_mode: boolean | null;
          allow_signups: boolean | null;
          trial_days: number | null;
          max_upload_size_mb: number | null;
          max_businesses_per_user: number | null;
          allowed_domains: string | null;
          updated_at: Timestamp | null;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          maintenance_mode?: boolean | null;
          allow_signups?: boolean | null;
          trial_days?: number | null;
          max_upload_size_mb?: number | null;
          max_businesses_per_user?: number | null;
          allowed_domains?: string | null;
          updated_at?: Timestamp | null;
          updated_by?: string | null;
        };
        Update: {
          maintenance_mode?: boolean | null;
          allow_signups?: boolean | null;
          trial_days?: number | null;
          max_upload_size_mb?: number | null;
          max_businesses_per_user?: number | null;
          allowed_domains?: string | null;
          updated_at?: Timestamp | null;
          updated_by?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: number;
          event: string;
          user_email: string | null;
          user_id: string | null;
          ip_address: string | null;
          status: string;
          details: Json | null;
          created_at: Timestamp | null;
        };
        Insert: {
          id?: number;
          event: string;
          user_email?: string | null;
          user_id?: string | null;
          ip_address?: string | null;
          status: string;
          details?: Json | null;
          created_at?: Timestamp | null;
        };
        Update: {
          event?: string;
          user_email?: string | null;
          user_id?: string | null;
          ip_address?: string | null;
          status?: string;
          details?: Json | null;
          created_at?: Timestamp | null;
        };
      };
      template_status: {
        Row: {
          id: string;
          is_active: boolean | null;
          updated_at: Timestamp | null;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          is_active?: boolean | null;
          updated_at?: Timestamp | null;
          updated_by?: string | null;
        };
        Update: {
          is_active?: boolean | null;
          updated_at?: Timestamp | null;
          updated_by?: string | null;
        };
      };
      loyalty_programs: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          points_required: number;
          reward_description: string;
          is_active: boolean | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          points_required?: number;
          reward_description: string;
          is_active?: boolean | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          points_required?: number;
          reward_description?: string;
          is_active?: boolean | null;
          updated_at?: Timestamp;
        };
      };
      loyalty_cards: {
        Row: {
          id: string;
          program_id: string;
          customer_phone: string;
          customer_name: string | null;
          current_points: number;
          total_points_earned: number;
          rewards_redeemed: number;
          last_activity_at: Timestamp;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          program_id: string;
          customer_phone: string;
          customer_name?: string | null;
          current_points?: number;
          total_points_earned?: number;
          rewards_redeemed?: number;
          last_activity_at?: Timestamp;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          customer_phone?: string;
          customer_name?: string | null;
          current_points?: number;
          total_points_earned?: number;
          rewards_redeemed?: number;
          last_activity_at?: Timestamp;
          updated_at?: Timestamp;
        };
      };
      loyalty_transactions: {
        Row: {
          id: string;
          card_id: string;
          points_change: number;
          transaction_type: string;
          notes: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          card_id: string;
          points_change: number;
          transaction_type: string;
          notes?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          points_change?: number;
          transaction_type?: string;
          notes?: string | null;
        };
      };
      business_categories: {
        Row: {
          id: string;
          key: string;
          label_pt: string;
          label_en: string;
          label_es: string;
          icon: string;
          sort_order: number;
          is_active: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          key: string;
          label_pt: string;
          label_en: string;
          label_es: string;
          icon: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          key?: string;
          label_pt?: string;
          label_en?: string;
          label_es?: string;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      // ============================================
      // Business OS — New Tables
      // ============================================
      business_verticals: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          status: string;
          default_modules: Json;
          default_pages: Json;
          default_navigation: Json;
          recommended_modules: Json;
          sort_order: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          status?: string;
          default_modules?: Json;
          default_pages?: Json;
          default_navigation?: Json;
          recommended_modules?: Json;
          sort_order?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          status?: string;
          default_modules?: Json;
          default_pages?: Json;
          default_navigation?: Json;
          recommended_modules?: Json;
          sort_order?: number;
          updated_at?: Timestamp;
        };
      };
      business_subverticals: {
        Row: {
          id: string;
          vertical_id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          default_modules: Json;
          default_pages: Json;
          sort_order: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          vertical_id: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          default_modules?: Json;
          default_pages?: Json;
          sort_order?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          default_modules?: Json;
          default_pages?: Json;
          sort_order?: number;
          updated_at?: Timestamp;
        };
      };
      modules: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          category: string;
          is_core: boolean;
          status: string;
          required_plan: string;
          sort_order: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          category?: string;
          is_core?: boolean;
          status?: string;
          required_plan?: string;
          sort_order?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          category?: string;
          is_core?: boolean;
          status?: string;
          required_plan?: string;
          sort_order?: number;
          updated_at?: Timestamp;
        };
      };
      business_enabled_modules: {
        Row: {
          id: string;
          business_id: string;
          module_id: string;
          enabled: boolean;
          source: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          module_id: string;
          enabled?: boolean;
          source?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          enabled?: boolean;
          source?: string;
          updated_at?: Timestamp;
        };
      };
      inbox_items: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          source_type: string;
          source_id: string | null;
          title: string;
          message: string | null;
          status: string;
          priority: string;
          assigned_to: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          source_type: string;
          source_id?: string | null;
          title: string;
          message?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          customer_id?: string | null;
          source_type?: string;
          source_id?: string | null;
          title?: string;
          message?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          updated_at?: Timestamp;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          tags: string[];
          source: string;
          last_interaction_at: Timestamp | null;
          total_visits: number;
          total_spent: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          tags?: string[];
          source?: string;
          last_interaction_at?: Timestamp | null;
          total_visits?: number;
          total_spent?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          tags?: string[];
          source?: string;
          last_interaction_at?: Timestamp | null;
          total_visits?: number;
          total_spent?: number;
          updated_at?: Timestamp;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          business_id: string;
          page_id: string | null;
          qr_code_id: string | null;
          event_type: string;
          metadata: Json;
          visitor_id: string | null;
          device: string | null;
          referrer: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          business_id: string;
          page_id?: string | null;
          qr_code_id?: string | null;
          event_type: string;
          metadata?: Json;
          visitor_id?: string | null;
          device?: string | null;
          referrer?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          page_id?: string | null;
          qr_code_id?: string | null;
          event_type?: string;
          metadata?: Json;
          visitor_id?: string | null;
          device?: string | null;
          referrer?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_enabled_modules_for_business: {
        Args: {
          p_business_id: string;
        };
        Returns: {
          module_id: string;
          module_slug: string;
          module_name: string;
          module_icon: string;
          module_category: string;
          is_core: boolean;
          source: string;
          enabled: boolean;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
