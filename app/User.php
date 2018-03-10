<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{

    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function getUserIdByMail($emails)
    {
        return self::userwithemail($emails)->get();
    }

    /**
     * scope function examples
     * @param $query
     * @param $emails
     */
    public function scopeUserWithEmail($query,$emails)
    {
        $query->wherein('email', $emails);
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function files()
    {
        return $this->hasMany('App\File','user_id');
    }

    public function roles()
    {
        return $this->belongsToMany('App\File', 'admin_files');
    }
}
