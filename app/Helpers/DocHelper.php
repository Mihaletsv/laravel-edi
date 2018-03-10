<?php

namespace App\Helpers;
use App\User;
trait DocHelper
{
    /**
     * @param $docs
     * @return mixed
     */
   public static function getContragentsIds($docs)
   {

       $recipient_ids = [];
       $usersTable = new User();
       if (!empty($docs['recipient'])) {
           foreach ($docs['recipient'] as $k => $rec) {
               $check['rec'] = $rec;
           }
           $docs['recipient'] = array_diff($docs['recipient'], ['']);

           $recipient_ids = $usersTable->getUserIdByMail($docs['recipient']);
       }

       return $recipient_ids;
   }
}
