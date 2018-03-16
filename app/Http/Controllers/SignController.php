<?php

namespace App\Http\Controllers;
use App\Helpers\SignHelper;
use Illuminate\Http\Request;

class SignController extends Controller
{

    protected $filesTable, $docsTable, $docs;
    public function onSignVerify(Request $request)
    {
echo json_encode('OKAY');
exit();
        //return SignHelper::VerifyCertCrl($cert_body);
    }




}
