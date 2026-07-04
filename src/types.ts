export interface Service {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  bullets?: Record<string, string[]>;
  order?: number;
  fullDescription?: Record<string, string>;
  expertise?: string[];
  relatedCategory?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: Record<string, string>;
  image: string;
  bio?: Record<string, string>;
  order?: number;
  email?: string;
}

export interface BlogPost {
  id: string;
  slug?: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  image: string;
  date: string;
  category: string;
  authorId?: string;
  language?: string;
  views?: number;
  seoKeywords?: string;
  seoMeta?: string;
  metaDescription?: string;
  imageAlt?: string;
  metaTitle?: string;
}
