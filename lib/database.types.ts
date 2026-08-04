export type AIPersona =
  | 'general'
  | 'ceo'
  | 'cto'
  | 'cmo'
  | 'cfo'
  | 'legal'
  | 'investor';

export type ProjectStage =
  | 'idea'
  | 'validation'
  | 'planning'
  | 'mvp'
  | 'launch'
  | 'growth';

export type DocumentType =
  | 'business_plan'
  | 'pitch_deck'
  | 'lean_canvas'
  | 'swot'
  | 'marketing_plan'
  | 'financial_projection'
  | 'investor_summary'
  | 'launch_checklist';

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          tagline: string | null;
          description: string | null;
          stage: ProjectStage;
          startup_score: number;
          investor_readiness: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          stage?: ProjectStage;
          startup_score?: number;
          investor_readiness?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          tagline?: string | null;
          description?: string | null;
          stage?: ProjectStage;
          startup_score?: number;
          investor_readiness?: number;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          persona: AIPersona;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          persona?: AIPersona;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          persona?: AIPersona;
          project_id?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          persona: AIPersona;
          metadata: MessageMetadata | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          persona?: AIPersona;
          metadata?: MessageMetadata | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          metadata?: MessageMetadata | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          chat_id: string | null;
          type: DocumentType;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          chat_id?: string | null;
          type: DocumentType;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          message_id: string | null;
          chat_id: string | null;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_id?: string | null;
          chat_id?: string | null;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          category: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          category?: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          completed?: boolean;
        };
      };
    };
  };
}

export interface MessageMetadata {
  tool?: string;
  toolResult?: unknown;
  followUpQuestions?: string[];
  citations?: string[];
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'radar';
    data: { label: string; value: number }[];
    title?: string;
  };
  documentGenerated?: {
    type: DocumentType;
    title: string;
  };
  suggestedTasks?: string[];
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type Chat = Database['public']['Tables']['chats']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type GeneratedDocument = Database['public']['Tables']['documents']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
