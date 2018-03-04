<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class DocFileController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index($fileid)
    {
        return view('doc',['fileid'=>$fileid]);
    }

    public function search(Request $request){
        if($request) {
            $term = $request->get('term');
            echo $term;
/*            $content = view(env('THEME').'.search_content')->with('posts', $posts)->render();
            $this->vars = array_add($this->vars, 'content', $content);
            return $this->renderOutput();*/
        }
        echo 'NO';
        //return abort(404);
    }

}
