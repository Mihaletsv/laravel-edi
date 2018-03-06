<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    public function getDocsData($owner)
    {
        return self::select('id','intOwnerId','varFileName','intSign','created_at')->
        where('intOwnerId',$owner)->get();
    }

    public function getDocById($id)
    {
        return self::find($id)->toArray();
    }
}
