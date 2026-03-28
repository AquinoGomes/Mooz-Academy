export type AcademicWorkType = "TCC" | "Trabalho Acadêmico" | "Artigo" | "Texto";
export type EventType = "Prova" | "Trabalho" | "Estudo" | "Lembrete";
export type BookType = "Famoso" | "Autônomo";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  bio?: string;
}

export interface Book {
  id?: string;
  uid: string;
  title: string;
  author: string;
  type: BookType;
  description: string;
  coverUrl?: string;
  createdAt: string;
}

export interface AcademicWork {
  id?: string;
  uid: string;
  title: string;
  type: AcademicWorkType;
  summary: string;
  createdAt: string;
}

export interface Poem {
  id?: string;
  uid: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface StudyEvent {
  id?: string;
  uid: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: EventType;
  createdAt: string;
}
