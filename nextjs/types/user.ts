import { Post } from "./post";

export type User = {
  id: string;
  name: string;
  email: string;
  posts: Post[] | null;
  created_at: string;
  updated_at: string;
}