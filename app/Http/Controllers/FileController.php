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

    public function displayFile($file_id)
    {
        $file = File::findOrFail($file_id);
        $docs_data = $file->docs()->whereNotNull('recipient_id')->latest()->get()->toArray();
        $this->prepareDocData($docs_data);
        return view('doc', [
                'file_id' => $file_id,
                'doc_data' => $docs_data,
                'doc_id' => null
            ]
        );
    }

    public function onGetAdmins(Request $request)
    {
        if ($request->ajax()) {
            $file_id = $request->all()['file_id'];
            $file = File::findOrFail($file_id);
            echo json_encode($file->roles);
/*            foreach ($file->roles as $admin) {
                $admins_data[] = User::findOrFail($admin->pivot->user_id);
            }

            echo json_encode($admins_data);*/
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
