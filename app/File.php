<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
class File extends Model
{
    //protected $dates = ['custom_at'];

    public function getDocsData($owner)
    {
        return self::select('id','user_id','varFileName','created_at')->
        where('user_id',$owner)->get();
    }

    public function getDocById($id)
    {
        $file = self::findOrFail($id);
/*        $file->created_at->addDays(8);
        $file->created_at->diffForHumans();*/
        return $file;
    }

    /**
     * An file is owned by a user
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function docs()
    {
        return $this->hasMany('App\Doc');
    }

    public function roles()
    {
        return $this->belongsToMany('App\User', 'admin_files');
    }


}
