export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  client: string;
  description: string;
  accentColor: string;
  tags: string[];
  metrics: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  color: string;
}

export interface StatItem {
  number: string;
  label: string;
  sublabel: string;
}

export interface AwardItem {
  year: string;
  title: string;
  category: string;
  organization: string;
  badge: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface ExperimentItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  image: string;
  tech: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  line: string;
}
