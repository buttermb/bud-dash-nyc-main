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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
        ]
      }
      courier_location_history: {
        Row: {
          accuracy: number | null
          courier_id: string | null
          heading: number | null
          id: string
          is_mock_location: boolean | null
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
          is_mock_location?: boolean | null
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
          is_mock_location?: boolean | null
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
          admin_pin: string | null
          admin_pin_verified: boolean | null
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
          pin_last_verified_at: string | null
          pin_set_at: string | null
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
          admin_pin?: string | null
          admin_pin_verified?: boolean | null
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
          pin_last_verified_at?: string | null
          pin_set_at?: string | null
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
          admin_pin?: string | null
          admin_pin_verified?: boolean | null
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
          pin_last_verified_at?: string | null
          pin_set_at?: string | null
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
        ]
      }
      geofence_checks: {
        Row: {
          action_allowed: boolean
          action_attempted: string | null
          check_timestamp: string | null
          created_at: string | null
          customer_lat: number
          customer_lng: number
          distance_miles: number
          driver_id: string | null
          driver_lat: number
          driver_lng: number
          id: string
          order_id: string | null
          override_approved: boolean | null
          override_reason: string | null
          override_requested: boolean | null
          within_geofence: boolean
        }
        Insert: {
          action_allowed: boolean
          action_attempted?: string | null
          check_timestamp?: string | null
          created_at?: string | null
          customer_lat: number
          customer_lng: number
          distance_miles: number
          driver_id?: string | null
          driver_lat: number
          driver_lng: number
          id?: string
          order_id?: string | null
          override_approved?: boolean | null
          override_reason?: string | null
          override_requested?: boolean | null
          within_geofence: boolean
        }
        Update: {
          action_allowed?: boolean
          action_attempted?: string | null
          check_timestamp?: string | null
          created_at?: string | null
          customer_lat?: number
          customer_lng?: number
          distance_miles?: number
          driver_id?: string | null
          driver_lat?: number
          driver_lng?: number
          id?: string
          order_id?: string | null
          override_approved?: boolean | null
          override_reason?: string | null
          override_requested?: boolean | null
          within_geofence?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "geofence_checks_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_checks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_entries: {
        Row: {
          base_entries: number | null
          entered_at: string | null
          entry_number_end: number | null
          entry_number_start: number | null
          giveaway_id: string | null
          id: string
          instagram_handle: string | null
          instagram_post_entries: number | null
          instagram_story_entries: number | null
          instagram_tag_url: string | null
          instagram_verified: boolean | null
          newsletter_entries: number | null
          referral_entries: number | null
          status: string | null
          total_entries: number | null
          user_borough: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_phone: string | null
        }
        Insert: {
          base_entries?: number | null
          entered_at?: string | null
          entry_number_end?: number | null
          entry_number_start?: number | null
          giveaway_id?: string | null
          id?: string
          instagram_handle?: string | null
          instagram_post_entries?: number | null
          instagram_story_entries?: number | null
          instagram_tag_url?: string | null
          instagram_verified?: boolean | null
          newsletter_entries?: number | null
          referral_entries?: number | null
          status?: string | null
          total_entries?: number | null
          user_borough?: string | null
          user_email?: string | null
          user_first_name?: string | null
          user_id?: string | null
          user_last_name?: string | null
          user_phone?: string | null
        }
        Update: {
          base_entries?: number | null
          entered_at?: string | null
          entry_number_end?: number | null
          entry_number_start?: number | null
          giveaway_id?: string | null
          id?: string
          instagram_handle?: string | null
          instagram_post_entries?: number | null
          instagram_story_entries?: number | null
          instagram_tag_url?: string | null
          instagram_verified?: boolean | null
          newsletter_entries?: number | null
          referral_entries?: number | null
          status?: string | null
          total_entries?: number | null
          user_borough?: string | null
          user_email?: string | null
          user_first_name?: string | null
          user_id?: string | null
          user_last_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_entries_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_referrals: {
        Row: {
          clicked_at: string | null
          converted: boolean | null
          created_at: string | null
          entries_awarded: number | null
          giveaway_id: string | null
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string | null
          signed_up_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          converted?: boolean | null
          created_at?: string | null
          entries_awarded?: number | null
          giveaway_id?: string | null
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          signed_up_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          converted?: boolean | null
          created_at?: string | null
          entries_awarded?: number | null
          giveaway_id?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          signed_up_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_referrals_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_winners: {
        Row: {
          claimed_at: string | null
          credit_amount: number | null
          credit_code: string | null
          entry_id: string | null
          giveaway_id: string | null
          id: string
          notified_at: string | null
          prize_rank: number
          prize_title: string | null
          prize_value: number | null
          selected_at: string | null
          status: string | null
          user_id: string | null
          winning_entry_number: number | null
        }
        Insert: {
          claimed_at?: string | null
          credit_amount?: number | null
          credit_code?: string | null
          entry_id?: string | null
          giveaway_id?: string | null
          id?: string
          notified_at?: string | null
          prize_rank: number
          prize_title?: string | null
          prize_value?: number | null
          selected_at?: string | null
          status?: string | null
          user_id?: string | null
          winning_entry_number?: number | null
        }
        Update: {
          claimed_at?: string | null
          credit_amount?: number | null
          credit_code?: string | null
          entry_id?: string | null
          giveaway_id?: string | null
          id?: string
          notified_at?: string | null
          prize_rank?: number
          prize_title?: string | null
          prize_value?: number | null
          selected_at?: string | null
          status?: string | null
          user_id?: string | null
          winning_entry_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_winners_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "giveaway_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "giveaway_winners_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          base_entries: number | null
          created_at: string | null
          description: string | null
          end_date: string
          grand_prize_description: string | null
          grand_prize_title: string | null
          grand_prize_value: number | null
          id: string
          instagram_post_bonus_entries: number | null
          instagram_story_bonus_entries: number | null
          newsletter_bonus_entries: number | null
          referral_bonus_entries: number | null
          second_prize_title: string | null
          second_prize_value: number | null
          slug: string
          start_date: string
          status: string | null
          tagline: string | null
          third_prize_title: string | null
          third_prize_value: number | null
          title: string
          total_entries: number | null
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          base_entries?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          grand_prize_description?: string | null
          grand_prize_title?: string | null
          grand_prize_value?: number | null
          id?: string
          instagram_post_bonus_entries?: number | null
          instagram_story_bonus_entries?: number | null
          newsletter_bonus_entries?: number | null
          referral_bonus_entries?: number | null
          second_prize_title?: string | null
          second_prize_value?: number | null
          slug: string
          start_date: string
          status?: string | null
          tagline?: string | null
          third_prize_title?: string | null
          third_prize_value?: number | null
          title: string
          total_entries?: number | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          base_entries?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          grand_prize_description?: string | null
          grand_prize_title?: string | null
          grand_prize_value?: number | null
          id?: string
          instagram_post_bonus_entries?: number | null
          instagram_story_bonus_entries?: number | null
          newsletter_bonus_entries?: number | null
          referral_bonus_entries?: number | null
          second_prize_title?: string | null
          second_prize_value?: number | null
          slug?: string
          start_date?: string
          status?: string | null
          tagline?: string | null
          third_prize_title?: string | null
          third_prize_value?: number | null
          title?: string
          total_entries?: number | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gps_anomalies: {
        Row: {
          accuracy_meters: number | null
          admin_notified: boolean | null
          anomaly_type: string
          courier_id: string
          detected_at: string | null
          id: string
          lat: number | null
          lng: number | null
          order_id: string | null
          resolved: boolean | null
          speed_mph: number | null
        }
        Insert: {
          accuracy_meters?: number | null
          admin_notified?: boolean | null
          anomaly_type: string
          courier_id: string
          detected_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          order_id?: string | null
          resolved?: boolean | null
          speed_mph?: number | null
        }
        Update: {
          accuracy_meters?: number | null
          admin_notified?: boolean | null
          anomaly_type?: string
          courier_id?: string
          detected_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          order_id?: string | null
          resolved?: boolean | null
          speed_mph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_anomalies_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_anomalies_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
      notification_preferences: {
        Row: {
          created_at: string | null
          email_all_updates: boolean | null
          email_confirmation_only: boolean | null
          email_enabled: boolean | null
          id: string
          push_all_updates: boolean | null
          push_critical_only: boolean | null
          push_enabled: boolean | null
          sms_all_updates: boolean | null
          sms_critical_only: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_all_updates?: boolean | null
          email_confirmation_only?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_all_updates?: boolean | null
          push_critical_only?: boolean | null
          push_enabled?: boolean | null
          sms_all_updates?: boolean | null
          sms_critical_only?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_all_updates?: boolean | null
          email_confirmation_only?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_all_updates?: boolean | null
          push_critical_only?: boolean | null
          push_enabled?: boolean | null
          sms_all_updates?: boolean | null
          sms_critical_only?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          notification_stage: number
          notification_type: string
          order_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          notification_stage: number
          notification_type: string
          order_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          notification_stage?: number
          notification_type?: string
          order_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          customer_lat: number | null
          customer_lng: number | null
          customer_location_accuracy: number | null
          customer_location_enabled: boolean | null
          customer_location_updated_at: string | null
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
          eta_minutes: number | null
          eta_updated_at: string | null
          flagged_at: string | null
          flagged_by: string | null
          flagged_reason: string | null
          id: string
          last_notification_sent_at: string | null
          merchant_id: string | null
          notification_sent_stage_1: boolean | null
          notification_sent_stage_2: boolean | null
          notification_sent_stage_3: boolean | null
          notification_sent_stage_4: boolean | null
          notification_sent_stage_5: boolean | null
          notification_sent_stage_6: boolean | null
          notification_sent_stage_7: boolean | null
          notification_sent_stage_8: boolean | null
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
          customer_lat?: number | null
          customer_lng?: number | null
          customer_location_accuracy?: number | null
          customer_location_enabled?: boolean | null
          customer_location_updated_at?: string | null
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
          eta_minutes?: number | null
          eta_updated_at?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          id?: string
          last_notification_sent_at?: string | null
          merchant_id?: string | null
          notification_sent_stage_1?: boolean | null
          notification_sent_stage_2?: boolean | null
          notification_sent_stage_3?: boolean | null
          notification_sent_stage_4?: boolean | null
          notification_sent_stage_5?: boolean | null
          notification_sent_stage_6?: boolean | null
          notification_sent_stage_7?: boolean | null
          notification_sent_stage_8?: boolean | null
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
          customer_lat?: number | null
          customer_lng?: number | null
          customer_location_accuracy?: number | null
          customer_location_enabled?: boolean | null
          customer_location_updated_at?: string | null
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
          eta_minutes?: number | null
          eta_updated_at?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          id?: string
          last_notification_sent_at?: string | null
          merchant_id?: string | null
          notification_sent_stage_1?: boolean | null
          notification_sent_stage_2?: boolean | null
          notification_sent_stage_3?: boolean | null
          notification_sent_stage_4?: boolean | null
          notification_sent_stage_5?: boolean | null
          notification_sent_stage_6?: boolean | null
          notification_sent_stage_7?: boolean | null
          notification_sent_stage_8?: boolean | null
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
      override_requests: {
        Row: {
          admin_notes: string | null
          courier_id: string
          created_at: string | null
          current_distance_miles: number
          customer_location_lat: number
          customer_location_lng: number
          driver_location_lat: number
          driver_location_lng: number
          id: string
          order_id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          courier_id: string
          created_at?: string | null
          current_distance_miles: number
          customer_location_lat: number
          customer_location_lng: number
          driver_location_lat: number
          driver_location_lng: number
          id?: string
          order_id: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          courier_id?: string
          created_at?: string | null
          current_distance_miles?: number
          customer_location_lat?: number
          customer_location_lng?: number
          driver_location_lat?: number
          driver_location_lng?: number
          id?: string
          order_id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "override_requests_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "override_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "override_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          batch_number: string | null
          category: string
          cbd_content: number | null
          coa_pdf_url: string | null
          coa_qr_code_url: string | null
          coa_url: string | null
          consumption_methods: string[] | null
          cost_per_unit: number | null
          created_at: string | null
          description: string | null
          effects: string[] | null
          effects_timeline: Json | null
          growing_info: Json | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          is_concentrate: boolean | null
          lab_name: string | null
          lab_results_url: string | null
          low_stock_alert: number | null
          medical_benefits: string[] | null
          merchant_id: string | null
          name: string
          price: number
          prices: Json | null
          review_count: number | null
          sale_price: number | null
          stock_quantity: number | null
          strain_info: string | null
          strain_lineage: string | null
          strain_type: string | null
          terpenes: Json | null
          test_date: string | null
          thc_content: number | null
          thca_percentage: number
          usage_tips: string | null
          vendor_name: string | null
          weight_grams: number | null
        }
        Insert: {
          average_rating?: number | null
          batch_number?: string | null
          category: string
          cbd_content?: number | null
          coa_pdf_url?: string | null
          coa_qr_code_url?: string | null
          coa_url?: string | null
          consumption_methods?: string[] | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          effects_timeline?: Json | null
          growing_info?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_concentrate?: boolean | null
          lab_name?: string | null
          lab_results_url?: string | null
          low_stock_alert?: number | null
          medical_benefits?: string[] | null
          merchant_id?: string | null
          name: string
          price: number
          prices?: Json | null
          review_count?: number | null
          sale_price?: number | null
          stock_quantity?: number | null
          strain_info?: string | null
          strain_lineage?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          test_date?: string | null
          thc_content?: number | null
          thca_percentage: number
          usage_tips?: string | null
          vendor_name?: string | null
          weight_grams?: number | null
        }
        Update: {
          average_rating?: number | null
          batch_number?: string | null
          category?: string
          cbd_content?: number | null
          coa_pdf_url?: string | null
          coa_qr_code_url?: string | null
          coa_url?: string | null
          consumption_methods?: string[] | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          effects_timeline?: Json | null
          growing_info?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_concentrate?: boolean | null
          lab_name?: string | null
          lab_results_url?: string | null
          low_stock_alert?: number | null
          medical_benefits?: string[] | null
          merchant_id?: string | null
          name?: string
          price?: number
          prices?: Json | null
          review_count?: number | null
          sale_price?: number | null
          stock_quantity?: number | null
          strain_info?: string | null
          strain_lineage?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          test_date?: string | null
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
          referral_code: string | null
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
          referral_code?: string | null
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
          referral_code?: string | null
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
      [_ in never]: never
    }
    Functions: {
      add_to_cart: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_selected_weight: string
          p_user_id: string
        }
        Returns: undefined
      }
      check_is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      decrement_inventory: {
        Args: { _product_id: string; _quantity: number }
        Returns: boolean
      }
      generate_admin_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_orders: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          courier_name: string
          courier_phone: string
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_borough: string
          id: string
          merchant_name: string
          order_number: string
          status: string
          total_amount: number
        }[]
      }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_couriers_with_daily_earnings: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_online: boolean
          phone: string
          rating: number
          today_earnings: number
          total_deliveries: number
          vehicle_type: string
        }[]
      }
      get_order_by_tracking_code: {
        Args: { code: string }
        Returns: Json
      }
      get_order_tracking_by_code: {
        Args: { tracking_code_param: string }
        Returns: {
          courier_lat: number
          courier_lng: number
          courier_name: string
          courier_vehicle: string
          created_at: string
          delivered_at: string
          delivery_address: string
          delivery_borough: string
          estimated_delivery: string
          id: string
          merchant_address: string
          merchant_name: string
          order_number: string
          status: string
          total_amount: number
          tracking_code: string
        }[]
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
      log_pin_verification: {
        Args: { courier_user_id: string; success: boolean }
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
      verify_admin_pin: {
        Args: { courier_user_id: string; pin: string }
        Returns: boolean
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
