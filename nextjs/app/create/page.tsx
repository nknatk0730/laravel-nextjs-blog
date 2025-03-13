import { createPost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function page() {
  return (
    <div>
      <form action={createPost} className="max-w-md mx-auto my-96 space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input id="title" type="text" name="title" required/>
        <Label htmlFor="content">Content</Label>
        <Input id="content" type="text" name="content" required />
        <Label htmlFor="image">Image</Label>
        <Input id="image" type="file" name="image" accept="image/*" required />
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
