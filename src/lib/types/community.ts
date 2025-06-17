export interface CommunityEventData {
  events: Event[];
}

export interface Event {
  id: number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  post: Post;
  name: string;
  category_id: number;
}

export interface Post {
  id: number;
  post_number: number;
  url: string;
  topic: Topic;
}

export interface Topic {
  id: number;
  title: string;
}
