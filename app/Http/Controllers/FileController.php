<?php

namespace App\Http\Controllers;

use App\File;
use App\User;
use Illuminate\Http\Request;

class FileController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('roleowner', ['only'=>'ongetadmins']);
    }

    public function index($file_id)
    {
        return view('doc',['file_id'=>$file_id]);
    }

    public function onGetAdmins(Request $request)
    {
        $admins_data = [];
        if($request->ajax()) {
            $file_id = $request->all()['file_id'];
            $file = File::findOrFail($file_id);
            foreach ($file->roles as $admin) {
                $admins_data[] = User::findOrFail($admin->pivot->user_id);
            }

            echo json_encode($admins_data);
        }
    }

}
