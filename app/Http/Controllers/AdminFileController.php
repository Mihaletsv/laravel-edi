<?php

namespace App\Http\Controllers;

use App\File;
use Illuminate\Http\Request;
use App\User;
use Auth;
use App\AdminFile;



class AdminFileController extends Controller
{


    public function index()
    {
       // return view('doc',['file_id'=>$file_id]);
    }


}
