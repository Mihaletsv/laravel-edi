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
        if($request->ajax()) {
            $file_id = $request->all()['file_id'];
        }
        else
        {
            $file_id = $request->file_id;
        }

        if ($file_id) {
            $file = File::findOrFail($file_id);
            if (Auth::user()->id != $file->user_id)
            {
                flash()->error('Только владелец документа может назначить администратора!');
                return redirect()->back();
            }
        }

        return $next($request);
    }
}
