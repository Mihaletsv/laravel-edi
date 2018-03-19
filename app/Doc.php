<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    protected static $currUserTypes = [
        'inbox'=>'recipient',
        'outbox'=>'sender',
    ];
    protected static $searchUserTypes = [
        'inbox'=>'sender',
        'outbox'=>'recipient',
    ];
    protected $fillable = [
        'file_id',
        'sender_id',
        'recipient_id',
        'varDocName'
    ];

    /**
     * @param $userid
     * @param $type
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection|static[]
     */
    public function getDocsData($userid, $type)
    {
        $query = self::select('docs.*', 'users.name as varUser', 'users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.' . self::$searchUserTypes[$type] . '_id')->
        where(self::$currUserTypes[$type] . '_id', $userid);
        if ($type == 'outbox')
        {
            $query = $query->whereNotNull('recipient_id');
        }
        $docs_data = $query->latest('updated_at')->get();
        return $docs_data;
    }

    /**
     * @param $userid
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection|static[]
     */
    public function getDocsDraft($userid)
    {
        return self::where('sender_id', $userid)->whereNull('recipient_id')->latest('updated_at')->get();
    }

    /**
     * @param $file_id
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection|static[]
     */
    public function getUsersAccess($file_id)
    {
        return self::select('users.name as varUser','users.email as varUserEmail')->
        leftJoin('users', 'users.id', '=', 'docs.recipient_id')->
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


    public function sign()
    {
        return $this->belongsTo('App\Sign');
    }
}
