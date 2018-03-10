<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class FileController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index($file_id)
    {
        return view('doc',['file_id'=>$file_id]);
    }

}
