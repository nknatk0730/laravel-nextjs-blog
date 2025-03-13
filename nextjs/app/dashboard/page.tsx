import { checkAuth, logout } from "@/actions/auth"
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default async function page() {
  const user = await checkAuth();

  const backendUrl = process.env.BACKEND_URL;

  return (
    <div className="p-4 space-y-8">
      <div className="flex items-center">
        <h1>Dashboard</h1>
        <span className="flex-1"></span>
        <div className="flex items-center space-x-4">
          <Link className={buttonVariants()} href='/create'>Create New Post</Link>
          <form action={logout}>
            <Button variant='destructive' type="submit">Logout</Button>
          </form>
        </div>
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-center">My Post</h2>
        {user.posts ? (
          <ul className="space-y-4">
            {user.posts.map(post => (
              <li key={post.id} className="p-4 space-y-4 text-center border border-gray-200 rounded-md">
                <h3>{post.title}</h3>
                <Image src={`${backendUrl}/storage/${post.image}`} alt={post.title} className="mx-auto" width={300} height={300} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts found</p>
        )}
      </div>
    </div>
  )
}
