<?php

use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->load('posts');
});

Route::post('/posts', [PostController::class, 'store'])->middleware('auth');

require __DIR__.'/auth.php';
