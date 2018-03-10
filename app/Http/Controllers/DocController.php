<?php

namespace App\Http\Controllers;

use App\File;
use Illuminate\Http\Request;
use App\User;
use App\Doc;
use Auth;
use App\Http\Requests\SendDocRequest;
use App\Helpers\DocHelper;

class DocController extends Controller
{
    public static $currUserTypes = [
        'inbox'=>'Recipient',
        'outbox'=>'Sender'
    ],
        $searchUserTypes = [
        'inbox'=>'Sender',
        'outbox'=>'Recipient'
    ];
    protected $filesTable, $docsTable;

    public function __construct()
    {
        $this->filesTable = new File();
        $this->docsTable = new Doc();
        $this->middleware('auth');
        $this->middleware('roleowner', ['only'=>'onsenddoc']);

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
            $this->docs = $this->docsTable->getDocsData(Auth::id(), self::$currUserTypes[$type],self::$searchUserTypes[$type]);
            //$this->prepareDocsData($this->docs, Auth::user(),$type);
        }

        return view('home',['docs'=>$this->docs, $type=>true]);
    }

   public function onSendDoc(SendDocRequest $request) {

        $data_insert = [];
        $recipient_ids = [];
        $docs = $request->all();
        $recipient_ids = DocHelper::getContragentsIds($docs);

    foreach ($recipient_ids as $k=>$rec_id)
    {
        $data_row = [];
        $data_row['file_id'] = $docs['file_id'];
        $data_row['intSenderId'] = Auth::id();
        $data_row['intRecipientId'] = $rec_id->id;
        $data_row['varDocName'] = $this->filesTable->getDocById($docs['file_id'])['varFileName'];
        $data_row['created_at'] = date('Y-m-d H:i:s', time());
        $data_insert[] = $data_row;
    }

    if (!empty($data_insert)) {
        $this->docsTable->insert($data_insert);
    }
       return redirect('home/docs/outbox');
   }

    public function onCreateAccess(SendDocRequest $request) {

        $data_insert = [];
        $recipient_ids = [];
        $docs = $request->all();
        $recipient_ids = DocHelper::getContragentsIds($docs);
        foreach ($recipient_ids as $k=>$rec_id)
        {
            $data_row = [];
            $data_row['file_id'] = $docs['file_id'];
            $data_row['user_id'] = $rec_id['id'];
            $data_row['created_at'] = date('Y-m-d H:i:s', time());
            $data_insert[] = $data_row;
        }
        dd($data_insert);
       // $this->docsTable->insert($data_insert);
        return redirect('home/docs/outbox');
    }
    public function onGetAccess(Request $request)
    {
        if($request->ajax()) {
            $file_id = $request->all()['file_id'];
            $users_access_data = $this->docsTable->getUsersAccess($file_id);
            echo json_encode($users_access_data);
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
