<?php

namespace App\Http\Controllers;

use App\File;
use App\Doc;
use App\User;
use Illuminate\Http\Request;
use App\Http\Requests\SendDocRequest;
use App\Helpers\DocHelper;
use App\Helpers\SignHelper;
use Illuminate\Support\Facades\DB;

class FileController extends Controller
{


    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('roleowner', ['only' => 'oncreateadmin']);
    }

    public function displayFile(Request $request)
    {
        $file = File::findOrFail($request->file_id);
        $docs_data = $file->docs()->whereNotNull('recipient_id')->latest()->get()->toArray();
        $this->prepareDocData($docs_data);
        return view('doc', [
                'file_id' => $request->file_id,
                'doc_data' => $docs_data,
                'doc_id' => null
            ]
        );
    }

    public function onGetAdmins(Request $request)
    {
        if ($request->ajax()) {
            $file = File::findOrFail($request->file_id);
            echo json_encode($file->roles);
        }
    }

    public function onCreateAdmin(SendDocRequest $request)
    {

        $request_data = $request->all();
        $recipient_ids = DocHelper::getContragentsIds($request_data);
        $file = File::find($request_data['file_id']);
        $file->roles()->detach();
        $file->roles()->attach($recipient_ids);

        /*
                 $data_insert = [];
        $recipient_ids = [];
         * foreach ($recipient_ids as $k=>$rec_id)
        {
            $data_row = [];
            $data_row['file_id'] = $request_data['file_id'];
            $data_row['user_id'] = $rec_id['id'];
            $data_row['created_at'] = date('Y-m-d H:i:s', time());
            $data_insert[] = $data_row;
        }
        DB::table('admin_users')->insert($data_insert);*/
        flash()->info('Администраторы изменены');
        return redirect()->back();
    }


    private function prepareDocData(&$docs_data)
    {
        foreach ($docs_data as $key => $doc) {
            $docs_data[$key]['recipient_data'] = User::find($doc['recipient_id'])->toArray();
            $docs_data[$key]['sender_data'] = User::find($doc['sender_id'])->toArray();
        }
    }

}
