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
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignment_pages: {
        Row: {
          assignment_id: string
          deleted_at: string | null
          file_path: string
          file_type: string
          id: string
          page_order: number
          rotation: number
          uploaded_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          deleted_at?: string | null
          file_path: string
          file_type: string
          id?: string
          page_order: number
          rotation?: number
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          assignment_id?: string
          deleted_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          page_order?: number
          rotation?: number
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_pages_assignment_id_user_id_fkey"
            columns: ["assignment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_name: string | null
          created_at: string
          extraction_error: string | null
          extraction_started_at: string | null
          extraction_status: Database["public"]["Enums"]["extraction_status"]
          id: string
          student_nickname: string
          user_id: string
        }
        Insert: {
          assignment_name?: string | null
          created_at?: string
          extraction_error?: string | null
          extraction_started_at?: string | null
          extraction_status?: Database["public"]["Enums"]["extraction_status"]
          id?: string
          student_nickname: string
          user_id?: string
        }
        Update: {
          assignment_name?: string | null
          created_at?: string
          extraction_error?: string | null
          extraction_started_at?: string | null
          extraction_status?: Database["public"]["Enums"]["extraction_status"]
          id?: string
          student_nickname?: string
          user_id?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          ai_result: Database["public"]["Enums"]["grade_result"]
          created_at: string
          feedback: string | null
          final_result: Database["public"]["Enums"]["grade_result"]
          generated_question_id: string
          id: string
          overridden_by_tutor: boolean
          student_answer_read: string | null
          submission_id: string
          user_id: string
          work_shown: boolean | null
        }
        Insert: {
          ai_result: Database["public"]["Enums"]["grade_result"]
          created_at?: string
          feedback?: string | null
          final_result: Database["public"]["Enums"]["grade_result"]
          generated_question_id: string
          id?: string
          overridden_by_tutor?: boolean
          student_answer_read?: string | null
          submission_id: string
          user_id?: string
          work_shown?: boolean | null
        }
        Update: {
          ai_result?: Database["public"]["Enums"]["grade_result"]
          created_at?: string
          feedback?: string | null
          final_result?: Database["public"]["Enums"]["grade_result"]
          generated_question_id?: string
          id?: string
          overridden_by_tutor?: boolean
          student_answer_read?: string | null
          submission_id?: string
          user_id?: string
          work_shown?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_generated_question_id_user_id_fkey"
            columns: ["generated_question_id", "user_id"]
            isOneToOne: false
            referencedRelation: "generated_questions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "attempts_submission_id_user_id_fkey"
            columns: ["submission_id", "user_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      extraction_results: {
        Row: {
          assignment_id: string
          created_at: string
          extraction_confidence: number | null
          id: string
          model_used: string
          notes: string | null
          score_as_written: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          extraction_confidence?: number | null
          id?: string
          model_used: string
          notes?: string | null
          score_as_written?: string | null
          user_id?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          extraction_confidence?: number | null
          id?: string
          model_used?: string
          notes?: string | null
          score_as_written?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_results_assignment_id_user_id_fkey"
            columns: ["assignment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      generated_questions: {
        Row: {
          answer_check: Json | null
          check_notes: string | null
          check_status: Database["public"]["Enums"]["check_status"]
          choices: Json | null
          correct_answer: string
          created_at: string
          generation_attempts: number
          hint: string | null
          id: string
          picture_spec: Json | null
          position: number
          question_id: string
          question_text: string
          requires_work: boolean
          session_id: string
          steps_to_solve: string | null
          user_id: string
        }
        Insert: {
          answer_check?: Json | null
          check_notes?: string | null
          check_status: Database["public"]["Enums"]["check_status"]
          choices?: Json | null
          correct_answer: string
          created_at?: string
          generation_attempts?: number
          hint?: string | null
          id?: string
          picture_spec?: Json | null
          position: number
          question_id: string
          question_text: string
          requires_work?: boolean
          session_id: string
          steps_to_solve?: string | null
          user_id?: string
        }
        Update: {
          answer_check?: Json | null
          check_notes?: string | null
          check_status?: Database["public"]["Enums"]["check_status"]
          choices?: Json | null
          correct_answer?: string
          created_at?: string
          generation_attempts?: number
          hint?: string | null
          id?: string
          picture_spec?: Json | null
          position?: number
          question_id?: string
          question_text?: string
          requires_work?: boolean
          session_id?: string
          steps_to_solve?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_questions_question_id_user_id_fkey"
            columns: ["question_id", "user_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "generated_questions_session_id_user_id_fkey"
            columns: ["session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_confirmed_at: string | null
          created_at: string
          id: string
          invited_by: string | null
          terms_accepted_at: string | null
          terms_version: string | null
        }
        Insert: {
          age_confirmed_at?: string | null
          created_at?: string
          id: string
          invited_by?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
        }
        Update: {
          age_confirmed_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          added_by_tutor: boolean
          assignment_id: string
          choices: Json | null
          confidence: number | null
          correct_answer: string | null
          created_at: string
          format: Database["public"]["Enums"]["question_format"]
          id: string
          marked_correct: boolean
          original_question_text: string
          picture_description: string | null
          points_earned: number | null
          points_possible: number | null
          position: number
          question_number: string
          question_type: string | null
          requires_work: boolean
          student_answer: string | null
          user_id: string
        }
        Insert: {
          added_by_tutor?: boolean
          assignment_id: string
          choices?: Json | null
          confidence?: number | null
          correct_answer?: string | null
          created_at?: string
          format: Database["public"]["Enums"]["question_format"]
          id?: string
          marked_correct: boolean
          original_question_text: string
          picture_description?: string | null
          points_earned?: number | null
          points_possible?: number | null
          position: number
          question_number: string
          question_type?: string | null
          requires_work?: boolean
          student_answer?: string | null
          user_id?: string
        }
        Update: {
          added_by_tutor?: boolean
          assignment_id?: string
          choices?: Json | null
          confidence?: number | null
          correct_answer?: string | null
          created_at?: string
          format?: Database["public"]["Enums"]["question_format"]
          id?: string
          marked_correct?: boolean
          original_question_text?: string
          picture_description?: string | null
          points_earned?: number | null
          points_possible?: number | null
          position?: number
          question_number?: string
          question_type?: string | null
          requires_work?: boolean
          student_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assignment_id_user_id_fkey"
            columns: ["assignment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      session_progress: {
        Row: {
          attempts_count: number
          generated_question_id: string
          id: string
          session_id: string
          stars_awarded: number
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          generated_question_id: string
          id?: string
          session_id: string
          stars_awarded?: number
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          attempts_count?: number
          generated_question_id?: string
          id?: string
          session_id?: string
          stars_awarded?: number
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_progress_generated_question_id_user_id_fkey"
            columns: ["generated_question_id", "user_id"]
            isOneToOne: false
            referencedRelation: "generated_questions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "session_progress_session_id_user_id_fkey"
            columns: ["session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      sessions: {
        Row: {
          assignment_id: string
          completed_at: string | null
          id: string
          practice_error: string | null
          practice_started_at: string | null
          practice_status: Database["public"]["Enums"]["practice_status"]
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          id?: string
          practice_error?: string | null
          practice_started_at?: string | null
          practice_status?: Database["public"]["Enums"]["practice_status"]
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          id?: string
          practice_error?: string | null
          practice_started_at?: string | null
          practice_status?: Database["public"]["Enums"]["practice_status"]
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_assignment_id_user_id_fkey"
            columns: ["assignment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      student_submissions: {
        Row: {
          attempt_number: number
          id: string
          session_id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          attempt_number: number
          id?: string
          session_id: string
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          attempt_number?: number
          id?: string
          session_id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_session_id_user_id_fkey"
            columns: ["session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      submission_pages: {
        Row: {
          deleted_at: string | null
          file_path: string
          file_type: string
          id: string
          page_order: number
          submission_id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          file_path: string
          file_type: string
          id?: string
          page_order: number
          submission_id: string
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          deleted_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          page_order?: number
          submission_id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_pages_submission_id_user_id_fkey"
            columns: ["submission_id", "user_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id", "user_id"]
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
      check_status: "passed" | "flagged" | "tutor_edited"
      extraction_status: "pending" | "processing" | "done" | "failed"
      grade_result: "pass" | "redo" | "needs_check" | "skipped"
      practice_status: "none" | "generating" | "ready" | "failed"
      progress_status: "pending" | "pass" | "redo" | "needs_check" | "skipped"
      question_format:
        | "multiple_choice"
        | "multiple_select"
        | "fill_in"
        | "open_response"
      session_status: "in_progress" | "completed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      check_status: ["passed", "flagged", "tutor_edited"],
      extraction_status: ["pending", "processing", "done", "failed"],
      grade_result: ["pass", "redo", "needs_check", "skipped"],
      practice_status: ["none", "generating", "ready", "failed"],
      progress_status: ["pending", "pass", "redo", "needs_check", "skipped"],
      question_format: [
        "multiple_choice",
        "multiple_select",
        "fill_in",
        "open_response",
      ],
      session_status: ["in_progress", "completed"],
    },
  },
} as const
