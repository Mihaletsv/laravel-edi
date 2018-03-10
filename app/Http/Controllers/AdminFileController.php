<?php

namespace App\Http\Controllers;

use App\File;
use Illuminate\Http\Request;
use App\User;
use Auth;
use App\AdminFile;
use App\Http\Requests\SendDocRequest;
use App\Helpers\DocHelper;

class AdminFileController extends Controller
{

    public function __construct()
    {
        $this->adminFileTable = new AdminFile();
        $this->middleware('roleowner');
        //$this->middleware('hasrelations');
    }

    public function index()
    {
       // return view('doc',['file_id'=>$file_id]);
    }
    public function onCreateAdminAccess(SendDocRequest $request) {

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
        $this->adminFileTable->insert($data_insert);
        return redirect()->back();
    }

}
