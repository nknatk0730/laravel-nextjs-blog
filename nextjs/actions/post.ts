"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const backendUrl = process.env.BACKEND_URL;

export const createPost = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File;

  if (!title || !content || !image.size) {
    throw new Error("All fields are required");
  }

  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const laravelSession = cookieStore.get("laravel_session")?.value;

  if (!xsrfToken || !laravelSession) {
    throw new Error("Unauthorized");
  }

  const form = new FormData();
  form.append("title", title);
  form.append("content", content);
  form.append("image", image);

  console.log(form);

  const response = await fetch(`${backendUrl}/posts`, {
    method: "POST",
    body: form,
    headers: {
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${laravelSession}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    console.error("Laravelからのエラー内容:", errorDetails);
    throw new Error(`Failed to create post: ${errorDetails.message}`);
  }

  redirect('/dashboard');
}