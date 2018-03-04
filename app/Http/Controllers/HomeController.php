<?php

namespace App\Http\Controllers;

use App\DocFile;
use App\UserDoc;
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
        $this->docfilesTable = new DocFile();

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
            $this->currentUser = Auth::user()->toArray();
            $this->docs = $this->docfilesTable->getDocsData($this->currentUser['id'])->toArray();

        }
        return view('home',['docs'=>$this->docs, 'currentUser'=>$this->currentUser]);
    }




}
