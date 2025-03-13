<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required|max:255',
            'image' => 'required|image',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // imageファイルのアップロード
        $image = $request->file('image');
        // $image_path = $image->store('public/images');
        $image_path = $image->store('images', 'public'); // 'public' ディスクを明示的に指定

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => $user->id,
            'image' => $image_path,
        ]);

        if (!$post) {
            return response()->json([
                'message' => 'Post creation failed.',
            ], 500);
        }

        return response()->json([
            'message' => 'Post created successfully.',
            'data' => $post,
        ], 201);
    }
}
