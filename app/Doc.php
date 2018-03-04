<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    public function getDocsData($userid, $userCurr, $userSearch)
    {
        return self::select('docs.*','users.name as varUser','users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.int'.$userSearch.'Id')->
        where('int'.$userCurr.'Id',$userid)->get();
    }
    public function getUsersAccess($fileid)
    {
        return self::select('users.name as varUser','users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.intRecipientId')->
        where('intFileId',$fileid)->groupBy('users.id')->get();
    }
}
