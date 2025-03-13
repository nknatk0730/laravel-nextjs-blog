import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function page() {
  return (
      <form action={login} className="text-center mx-auto max-w-md px-4 py-96 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" id="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Password</Label>
          <Input name="password" type="password" id="password" />
        </div>
        <Button type="submit">Login</Button>
      </form>
  );
}
