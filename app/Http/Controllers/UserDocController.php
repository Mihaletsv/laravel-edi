<?php

namespace App\Http\Controllers;

use App\DocFile;
use Illuminate\Http\Request;
use App\User;
use App\UserDoc;
use Auth;
class UserDocController extends Controller
{
    public static $currUserTypes = [
        'inbox'=>'Recipient',
        'outbox'=>'Sender'
    ],
        $searchUserTypes = [
        'inbox'=>'Sender',
        'outbox'=>'Recipient'
    ];
    protected $docfilesTable;

    public function __construct()
    {
        $this->docfilesTable = new DocFile();
        $this->userDocTable = new UserDoc();
        $this->middleware('auth');

    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($type = null)
    {

        if (Auth::check())
        {
            $this->docs = $this->userDocTable->getDocsData(Auth::id(), self::$currUserTypes[$type],self::$searchUserTypes[$type])->toArray();
            //$this->prepareDocsData($this->docs, Auth::user(),$type);
        }

        return view('home',['docs'=>$this->docs, $type=>true]);
    }

   public function onSendDoc(Request $request) {
    $usersTable = new User();
    $docs = $request->all();
    if (empty($docs['fileid'])) {
        echo 'Error';
    }
    if (isset($docs['recipient'])) {
        $docs['recipient'] = array_diff($docs['recipient'], ['']);
        $recipient_ids = $usersTable->getUserIdByMail($docs['recipient'])->toArray();
    }

    foreach ($recipient_ids as $k=>$rec_id)
    {
        $data_row = [];
        $data_row['intFileId'] = $docs['fileid'];
        $data_row['intSenderId'] = Auth::id();
        $data_row['intRecipientId'] = $rec_id['id'];
        $data_row['varDocName'] = $this->docfilesTable->getDocById($docs['fileid'])->toArray()['varFileName'];
        $data_row['created_at'] = date('Y-m-d H:i:s', time());
        $data_insert[] = $data_row;
    }
       $result = UserDoc::insert($data_insert);
       return redirect('home/userdocs/outbox');
   }


    public function onGetAccess(Request $request)
    {
        if($request->ajax()) {
            $fileid = $request->all()['fileid'];
            $users_access_data = $this->userDocTable->getUsersAccess($fileid)->toArray();
            echo json_encode($users_access_data);
            //die;
        }
    }


   private function prepareDocsData (&$docs, $user_data, $type)
   {
       foreach ($docs as $key=>$doc)
       {
           $docs[$key]['var'.self::$currUserTypes[$type]] = $user_data['name'];
       }
   }
}
