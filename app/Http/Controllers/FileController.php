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

    public function index($fileid)
    {
        return view('doc',['fileid'=>$fileid]);
    }

}
