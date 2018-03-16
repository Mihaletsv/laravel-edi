<?php

namespace App\Http\Controllers;

use App\File;

use Illuminate\Http\Request;
use Auth;

class HomeController extends Controller
{
    protected $docTable,
        $docs=[],
        $currentUser=[];
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->filesTable = new File();

    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (Auth::check())
        {
            $this->currentUser = Auth::user();
            $this->docs = $this->filesTable->getDocsData($this->currentUser['id']);

        }
        return view('home',['docs'=>$this->docs, 'currentUser'=>$this->currentUser]);
    }




}
