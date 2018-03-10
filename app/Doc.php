<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    protected $fillable = [
        'file_id',
        'intSenderId',
        'intRecipientId',
        'varDocName'
    ];
    public function getDocsData($userid, $userCurr, $userSearch)
    {
        $docs_data = self::select('docs.*','users.name as varUser','users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.int'.$userSearch.'Id')->
        where('int'.$userCurr.'Id',$userid)->latest()->get();

        return $docs_data;
    }
    public function getUsersAccess($file_id)
    {
        return self::select('users.name as varUser','users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.intRecipientId')->
        where('file_id',$file_id)->groupBy('users.id')->get();
    }

    /**
     * An file is owned by a user
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function file()
    {
        return $this->belongsTo('App\File');
    }
}
