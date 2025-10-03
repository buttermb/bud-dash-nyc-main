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
      addresses: {
        Row: {
          apartment: string | null
          borough: string
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          lat: number | null
          latitude: number | null
          lng: number | null
          longitude: number | null
          state: string
          street: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          apartment?: string | null
          borough: string
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          state?: string
          street: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          apartment?: string | null
          borough?: string
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          state?: string
          street?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      age_verifications: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          id_number: string | null
          id_type: string | null
          selfie_url: string | null
          user_id: string
          verification_method: string
          verification_type: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number?: string | null
          id_type?: string | null
          selfie_url?: string | null
          user_id: string
          verification_method: string
          verification_type: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number?: string | null
          id_type?: string | null
          selfie_url?: string | null
          user_id?: string
          verification_method?: string
          verification_type?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          selected_weight: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          selected_weight?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          selected_weight?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_applications: {
        Row: {
          admin_notes: string | null
          borough: string
          created_at: string | null
          email: string
          experience: string
          full_name: string
          id: string
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          vehicle_type: string
        }
        Insert: {
          admin_notes?: string | null
          borough: string
          created_at?: string | null
          email: string
          experience: string
          full_name: string
          id?: string
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          vehicle_type: string
        }
        Update: {
          admin_notes?: string | null
          borough?: string
          created_at?: string | null
          email?: string
          experience?: string
          full_name?: string
          id?: string
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_bonuses: {
        Row: {
          amount: number
          bonus_type: string
          courier_id: string | null
          description: string | null
          earned_at: string | null
          id: string
        }
        Insert: {
          amount: number
          bonus_type: string
          courier_id?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
        }
        Update: {
          amount?: number
          bonus_type?: string
          courier_id?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_bonuses_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_earnings: {
        Row: {
          base_pay: number | null
          bonus_amount: number | null
          commission_amount: number
          commission_rate: number
          courier_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          order_total: number
          paid_at: string | null
          payment_method: string | null
          status: string | null
          tip_amount: number | null
          total_earned: number
          week_start_date: string
        }
        Insert: {
          base_pay?: number | null
          bonus_amount?: number | null
          commission_amount: number
          commission_rate: number
          courier_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_total: number
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          tip_amount?: number | null
          total_earned: number
          week_start_date: string
        }
        Update: {
          base_pay?: number | null
          bonus_amount?: number | null
          commission_amount?: number
          commission_rate?: number
          courier_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_total?: number
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          tip_amount?: number | null
          total_earned?: number
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_earnings_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_location_history: {
        Row: {
          accuracy: number | null
          courier_id: string | null
          heading: number | null
          id: string
          lat: number
          lng: number
          order_id: string | null
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          courier_id?: string | null
          heading?: number | null
          id?: string
          lat: number
          lng: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          courier_id?: string | null
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courier_location_history_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_location_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_location_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_messages: {
        Row: {
          courier_id: string | null
          created_at: string | null
          id: string
          message: string
          order_id: string | null
          read: boolean | null
          sender_type: string
        }
        Insert: {
          courier_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          read?: boolean | null
          sender_type: string
        }
        Update: {
          courier_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_messages_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_metrics: {
        Row: {
          avg_delivery_time_minutes: number | null
          avg_rating: number | null
          courier_id: string | null
          date: string
          deliveries_cancelled: number | null
          deliveries_completed: number | null
          id: string
          id_verification_failures: number | null
          late_deliveries: number | null
          total_distance_miles: number | null
          total_earnings: number | null
          total_ratings: number | null
        }
        Insert: {
          avg_delivery_time_minutes?: number | null
          avg_rating?: number | null
          courier_id?: string | null
          date: string
          deliveries_cancelled?: number | null
          deliveries_completed?: number | null
          id?: string
          id_verification_failures?: number | null
          late_deliveries?: number | null
          total_distance_miles?: number | null
          total_earnings?: number | null
          total_ratings?: number | null
        }
        Update: {
          avg_delivery_time_minutes?: number | null
          avg_rating?: number | null
          courier_id?: string | null
          date?: string
          deliveries_cancelled?: number | null
          deliveries_completed?: number | null
          id?: string
          id_verification_failures?: number | null
          late_deliveries?: number | null
          total_distance_miles?: number | null
          total_earnings?: number | null
          total_ratings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courier_metrics_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_shifts: {
        Row: {
          courier_id: string | null
          ended_at: string | null
          id: string
          started_at: string
          status: string | null
          total_deliveries: number | null
          total_earnings: number | null
          total_hours: number | null
        }
        Insert: {
          courier_id?: string | null
          ended_at?: string | null
          id?: string
          started_at: string
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          total_hours?: number | null
        }
        Update: {
          courier_id?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courier_shifts_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_streaks: {
        Row: {
          bonus_earned: number | null
          consecutive_deliveries: number | null
          courier_id: string | null
          id: string
          streak_date: string
        }
        Insert: {
          bonus_earned?: number | null
          consecutive_deliveries?: number | null
          courier_id?: string | null
          id?: string
          streak_date: string
        }
        Update: {
          bonus_earned?: number | null
          consecutive_deliveries?: number | null
          courier_id?: string | null
          id?: string
          streak_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_streaks_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          age_verified: boolean | null
          commission_rate: number | null
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_online: boolean | null
          last_location_update: string | null
          license_number: string
          notification_sound: boolean | null
          notification_vibrate: boolean | null
          on_time_rate: number | null
          phone: string
          pin_hash: string | null
          profile_photo_url: string | null
          rating: number | null
          total_deliveries: number | null
          updated_at: string | null
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: string
        }
        Insert: {
          age_verified?: boolean | null
          commission_rate?: number | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_location_update?: string | null
          license_number: string
          notification_sound?: boolean | null
          notification_vibrate?: boolean | null
          on_time_rate?: number | null
          phone: string
          pin_hash?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type: string
        }
        Update: {
          age_verified?: boolean | null
          commission_rate?: number | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_location_update?: string | null
          license_number?: string
          notification_sound?: boolean | null
          notification_vibrate?: boolean | null
          on_time_rate?: number | null
          phone?: string
          pin_hash?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          actual_dropoff_time: string | null
          actual_pickup_time: string | null
          courier_id: string
          created_at: string | null
          delivery_notes: string | null
          delivery_photo_url: string | null
          dropoff_lat: number
          dropoff_lng: number
          estimated_dropoff_time: string | null
          estimated_pickup_time: string | null
          id: string
          id_verification_url: string | null
          manifest_url: string | null
          order_id: string
          pickup_lat: number
          pickup_lng: number
          pickup_photo_url: string | null
          signature_url: string | null
        }
        Insert: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          courier_id: string
          created_at?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          dropoff_lat: number
          dropoff_lng: number
          estimated_dropoff_time?: string | null
          estimated_pickup_time?: string | null
          id?: string
          id_verification_url?: string | null
          manifest_url?: string | null
          order_id: string
          pickup_lat: number
          pickup_lng: number
          pickup_photo_url?: string | null
          signature_url?: string | null
        }
        Update: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          courier_id?: string
          created_at?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          dropoff_lat?: number
          dropoff_lng?: number
          estimated_dropoff_time?: string | null
          estimated_pickup_time?: string | null
          id?: string
          id_verification_url?: string | null
          manifest_url?: string | null
          order_id?: string
          pickup_lat?: number
          pickup_lng?: number
          pickup_photo_url?: string | null
          signature_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          merchant_id: string
          product_id: string
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          merchant_id: string
          product_id: string
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          merchant_id?: string
          product_id?: string
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string | null
          id: string
          lifetime_points: number
          points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lifetime_points?: number
          points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lifetime_points?: number
          points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string
          borough: string
          business_name: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          latitude: number | null
          license_number: string
          license_verified: boolean | null
          longitude: number | null
          phone: string
          service_radius: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          borough: string
          business_name: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          license_number: string
          license_verified?: boolean | null
          longitude?: number | null
          phone: string
          service_radius?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          borough?: string
          business_name?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          license_number?: string
          license_verified?: boolean | null
          longitude?: number | null
          phone?: string
          service_radius?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          changed_by_id: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_id?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Update: {
          changed_by?: string | null
          changed_by_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          message: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          message?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          message?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          address_id: string | null
          courier_accepted_at: string | null
          courier_assigned_at: string | null
          courier_feedback: string | null
          courier_id: string | null
          courier_rating: number | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_signature_url: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_borough: string
          delivery_fee: number
          delivery_notes: string | null
          distance_miles: number | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_delivery: string | null
          id: string
          merchant_id: string | null
          order_number: string | null
          payment_method: string
          payment_status: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          proof_of_delivery_url: string | null
          requires_id_check: boolean | null
          scheduled_delivery_time: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          tip_amount: number | null
          total_amount: number
          tracking_code: string | null
          tracking_url: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          address_id?: string | null
          courier_accepted_at?: string | null
          courier_assigned_at?: string | null
          courier_feedback?: string | null
          courier_id?: string | null
          courier_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_signature_url?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_borough: string
          delivery_fee: number
          delivery_notes?: string | null
          distance_miles?: number | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_delivery?: string | null
          id?: string
          merchant_id?: string | null
          order_number?: string | null
          payment_method: string
          payment_status?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          proof_of_delivery_url?: string | null
          requires_id_check?: boolean | null
          scheduled_delivery_time?: string | null
          special_instructions?: string | null
          status?: string
          subtotal: number
          tip_amount?: number | null
          total_amount: number
          tracking_code?: string | null
          tracking_url?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          address_id?: string | null
          courier_accepted_at?: string | null
          courier_assigned_at?: string | null
          courier_feedback?: string | null
          courier_id?: string | null
          courier_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_signature_url?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_borough?: string
          delivery_fee?: number
          delivery_notes?: string | null
          distance_miles?: number | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_delivery?: string | null
          id?: string
          merchant_id?: string | null
          order_number?: string | null
          payment_method?: string
          payment_status?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          proof_of_delivery_url?: string | null
          requires_id_check?: boolean | null
          scheduled_delivery_time?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          tip_amount?: number | null
          total_amount?: number
          tracking_code?: string | null
          tracking_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          category: string
          cbd_content: number | null
          coa_pdf_url: string | null
          coa_qr_code_url: string | null
          coa_url: string | null
          consumption_methods: string[] | null
          created_at: string | null
          description: string | null
          effects: string[] | null
          effects_timeline: Json | null
          growing_info: Json | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          is_concentrate: boolean | null
          lab_results_url: string | null
          medical_benefits: string[] | null
          merchant_id: string | null
          name: string
          price: number
          prices: Json | null
          review_count: number | null
          strain_info: string | null
          strain_lineage: string | null
          strain_type: string | null
          terpenes: Json | null
          thc_content: number | null
          thca_percentage: number
          usage_tips: string | null
          vendor_name: string | null
          weight_grams: number | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          cbd_content?: number | null
          coa_pdf_url?: string | null
          coa_qr_code_url?: string | null
          coa_url?: string | null
          consumption_methods?: string[] | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          effects_timeline?: Json | null
          growing_info?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_concentrate?: boolean | null
          lab_results_url?: string | null
          medical_benefits?: string[] | null
          merchant_id?: string | null
          name: string
          price: number
          prices?: Json | null
          review_count?: number | null
          strain_info?: string | null
          strain_lineage?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          thc_content?: number | null
          thca_percentage: number
          usage_tips?: string | null
          vendor_name?: string | null
          weight_grams?: number | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          cbd_content?: number | null
          coa_pdf_url?: string | null
          coa_qr_code_url?: string | null
          coa_url?: string | null
          consumption_methods?: string[] | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          effects_timeline?: Json | null
          growing_info?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_concentrate?: boolean | null
          lab_results_url?: string | null
          medical_benefits?: string[] | null
          merchant_id?: string | null
          name?: string
          price?: number
          prices?: Json | null
          review_count?: number | null
          strain_info?: string | null
          strain_lineage?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          thc_content?: number | null
          thca_percentage?: number
          usage_tips?: string | null
          vendor_name?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_verified: boolean | null
          created_at: string | null
          full_name: string | null
          id: string
          id_document_url: string | null
          phone: string | null
          user_id: string
          verification_approved_at: string | null
          verification_rejected_at: string | null
          verification_rejection_reason: string | null
          verification_submitted_at: string | null
        }
        Insert: {
          age_verified?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          phone?: string | null
          user_id: string
          verification_approved_at?: string | null
          verification_rejected_at?: string | null
          verification_rejection_reason?: string | null
          verification_submitted_at?: string | null
        }
        Update: {
          age_verified?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          phone?: string | null
          user_id?: string
          verification_approved_at?: string | null
          verification_rejected_at?: string | null
          verification_rejection_reason?: string | null
          verification_submitted_at?: string | null
        }
        Relationships: []
      }
      purchase_limits: {
        Row: {
          concentrate_grams: number | null
          created_at: string | null
          date: string
          flower_grams: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          concentrate_grams?: number | null
          created_at?: string | null
          date: string
          flower_grams?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          concentrate_grams?: number | null
          created_at?: string | null
          date?: string
          flower_grams?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recent_purchases: {
        Row: {
          created_at: string | null
          customer_name: string
          id: string
          location: string
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          id?: string
          location: string
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          id?: string
          location?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recent_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          order_id: string | null
          photo_urls: string[] | null
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          photo_urls?: string[] | null
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          photo_urls?: string[] | null
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "public_order_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_order_tracking: {
        Row: {
          courier_lat: number | null
          courier_lng: number | null
          courier_name: string | null
          courier_vehicle: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_borough: string | null
          estimated_delivery: string | null
          id: string | null
          merchant_address: string | null
          merchant_name: string | null
          order_number: string | null
          status: string | null
          total_amount: number | null
          tracking_code: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      decrement_inventory: {
        Args: { _product_id: string; _quantity: number }
        Returns: boolean
      }
      generate_tracking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_age_verified: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_document_access: {
        Args: { _access_type: string; _verification_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          _action: string
          _details?: Json
          _entity_id: string
          _entity_type: string
          _ip_address?: string
          _user_id: string
        }
        Returns: string
      }
      update_purchase_limits: {
        Args: {
          _concentrate_grams: number
          _date: string
          _flower_grams: number
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "compliance_officer" | "support"
      app_role: "admin" | "courier" | "user"
      order_status_type:
        | "pending"
        | "accepted"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method_type: "cash" | "crypto"
      payment_status_type: "pending" | "completed" | "failed" | "refunded"
      product_category_type:
        | "flower"
        | "edibles"
        | "vapes"
        | "concentrates"
        | "pre-rolls"
      vehicle_type: "car" | "bike" | "scooter" | "ebike"
      verification_method_type: "jumio" | "manual_scan" | "automatic"
      verification_type: "registration" | "delivery"
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
    Enums: {
      admin_role: ["super_admin", "admin", "compliance_officer", "support"],
      app_role: ["admin", "courier", "user"],
      order_status_type: [
        "pending",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method_type: ["cash", "crypto"],
      payment_status_type: ["pending", "completed", "failed", "refunded"],
      product_category_type: [
        "flower",
        "edibles",
        "vapes",
        "concentrates",
        "pre-rolls",
      ],
      vehicle_type: ["car", "bike", "scooter", "ebike"],
      verification_method_type: ["jumio", "manual_scan", "automatic"],
      verification_type: ["registration", "delivery"],
    },
  },
} as const
