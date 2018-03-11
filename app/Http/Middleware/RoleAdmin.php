<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\File;
class RoleAdmin
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
        $cur_user_id = Auth::user()->id;
        if ($request->file_id) {
            $file = File::findOrFail($request->file_id);
            if ($cur_user_id != $file->user_id)
            {
              $noaccess = true;
              foreach ($file->roles as $admin)
              {

                  if ($cur_user_id == $admin->pivot->user_id)
                  {
                    unset($noaccess);
                    break;
                  }
              }
            }
        }
        if (isset($noaccess))
        {
            flash()->error('У вас нет права отправлять этот документ!');
            return redirect()->back();
        }
        return $next($request);
    }
}
