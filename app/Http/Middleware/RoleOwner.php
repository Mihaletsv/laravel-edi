<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\File;

class RoleOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->file_id) {
            $file = File::findOrFail($request->file_id);
            if (Auth::user()->id != $file->user_id)
            {
                return redirect()->back();
            }
        }

        return $next($request);
    }
}
