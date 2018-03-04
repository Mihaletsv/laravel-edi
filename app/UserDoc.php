<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserDoc extends Model
{
    public function getDocsData($userid, $userCurr, $userSearch)
    {
        return self::select('user_docs.*','users.name as varUser','users.email as varUserEmail')->leftJoin('users', 'users.id', '=', 'user_docs.int'.$userSearch.'Id')->where('int'.$userCurr.'Id',$userid)->get();
    }
    public function getUsersAccess($fileid)
    {
        return self::select('users.name as varUser','users.email as varUserEmail')->leftJoin('users', 'users.id', '=', 'user_docs.intRecipientId')->where('intFileId',$fileid)->groupBy('users.id')->get();
    }
}
