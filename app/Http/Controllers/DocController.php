<?php

namespace App\Http\Controllers;

use App\File;
use Illuminate\Http\Request;
use App\User;
use App\Doc;
use Auth;
use Validator;
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

   public function onSendDoc(Request $request) {
/*       $order = [
           'title' => 'Wii U',
           'description' => 'Game console from Nintendo'
       ];*/
      // dd($request->all());
       $rules = ['rec'=>'required|email'];


    $usersTable = new User();
    $docs = $request->all();
    if (empty($docs['fileid'])) {
        echo 'Error';
    }

    if (isset($docs['recipient'])) {
        foreach ($docs['recipient'] as $k=>$rec)
        {
            $check['rec'] = $rec;
            //$this->validate($check, $rules);

/*            $validator = Validator::make($check, $rules);
            if ($validator->fails())
            {
                dd($validator->messages()); // validation errors array
            }*/
        }


        $docs['recipient'] = array_diff($docs['recipient'], ['']);
        $recipient_ids = $usersTable->getUserIdByMail($docs['recipient'])->toArray();
    }

    foreach ($recipient_ids as $k=>$rec_id)
    {
        $data_row = [];
        $data_row['intFileId'] = $docs['fileid'];
        $data_row['intSenderId'] = Auth::id();
        $data_row['intRecipientId'] = $rec_id['id'];
        $data_row['varDocName'] = $this->filesTable->getDocById($docs['fileid'])['varFileName'];
        $data_row['created_at'] = date('Y-m-d H:i:s', time());
        $data_insert[] = $data_row;
    }
       Doc::insert($data_insert);
       return redirect('home/docs/outbox');
   }


    public function onGetAccess(Request $request)
    {
        if($request->ajax()) {
            $fileid = $request->all()['fileid'];
            $users_access_data = $this->docsTable->getUsersAccess($fileid);
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
