<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
class Sign extends Model
{
    public $timestamps = false;

    public function docs()
    {
        return $this->hasMany('App\Doc');
    }
}

