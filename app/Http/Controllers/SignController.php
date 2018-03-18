<?php

namespace App\Http\Controllers;
use App\Helpers\SignHelper;
use Illuminate\Http\Request;

class SignController extends Controller
{

    protected $filesTable, $docsTable, $docs;
    public function onSignVerify(Request $request)
    {
        //session_write_close();
        $result = SignHelper::verifyCertCrl($request->varCertBody);
        echo json_encode($result);
        exit();
    }




}
